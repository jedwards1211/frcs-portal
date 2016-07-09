import r from '../database/rethinkdriver'
import ldap from 'ldapjs'
import ldapConfig from './ldapConfig'
import {getUserByEmail, getUserByUsername, getAltLoginMessage} from '../../server/graphql/models/User/helpers'
import bcrypt from 'bcrypt'
import promisify from 'es6-promisify'
const compare = promisify(bcrypt.compare)

const {base, admin, adminPassword, users, groups} = ldapConfig

const server = ldap.createServer()

function authorize(req, res, next) {
  /* Any user may search after bind, only cn=root has full power */
  if (!req.connection.ldap.bindDN.equals(admin.dn))
    return next(new ldap.InsufficientAccessRightsError())

  return next()
}

function matches(entry, req) {
  if (!req.filter.matches(entry)) return false
  if (req.scope === 'sub' && req.dn.parentOf(entry.dn)) return true
  return req.dn.equals(entry.dn)
}

server.bind(base.dn, async (req, res, next) => {
  console.log('bind: ', req.toString())

  if (req.dn.equals(admin.dn)) {
    if (req.credentials === adminPassword) {
      res.end()
      return next()
    }
  } else if (req.dn.childOf(users.dn)) {
    const match = /^uid\s*=\s*([^,]+)/.exec(req.dn.toString())
    if (!match) return next(new ldap.InvalidCredentialsError())

    const uid = match[1]

    const user = await getUserByEmail(uid) || await getUserByUsername(uid)
    if (!user) return next(new ldap.InvalidCredentialsError())

    const {strategies} = user
    const hashedPassword = strategies && strategies.local && strategies.local.password
    if (!hashedPassword) return next(new ldap.InvalidCredentialsError(getAltLoginMessage(strategies)))

    const isCorrectPass = await compare(req.credentials, hashedPassword)
    if (isCorrectPass) {
      res.end()
      return next()
    }
  }
  return next(new ldap.InvalidCredentialsError())
})

server.search(base.dn, authorize, async (req, res, next) => {
  console.log('search: ', req.toString())
  console.log()

  if (matches(base, req)) res.send(base)
  if (matches(admin, req)) res.send(admin)
  if (matches(users, req)) res.send(users)
  if (matches(groups, req)) res.send(groups)

  await r.table('users').run().then(rUsers => rUsers.forEach(rUser => {
    console.log(rUser)

    const displayname = rUser.firstName || rUser.lastName
      ? [rUser.firstName, rUser.lastName].filter(i => Boolean(i)).join(' ')
      : rUser.username
    const attributes = {
      entryuuid: rUser.username,
      displayname,
      uid: displayname,
      mail: rUser.email
    }
    const user = {
      dn: `uid=${rUser.username},${users.dn}`,
      objectclass: [
        'inetOrgPerson',
        'posixAccount',
        'top'
      ],
      attributes,
      ...attributes
    }
    if (matches(user, req)) res.send(user)
  }))

  res.end()
  return next()
})

server.listen(ldapConfig.port, () => {
  console.log('LDAP server listening at %s', server.url)
})
