import r from '../database/rethinkdriver'
import ldap from 'ldapjs'
import ldapConfig from './ldapConfig'
import {getUserByEmail, getUserByUsername, getAltLoginMessage} from '../../server/graphql/models/User/helpers'
import bcrypt from 'bcrypt'
import promisify from 'es6-promisify'
import logger from '../logger'
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
  function helper() {
    if (!req.filter.matches(entry)) return false
    if (req.scope === 'sub' && req.dn.parentOf(entry.dn)) return true
    return req.dn.equals(entry.dn)
  }
  const result = helper()
  if (result) console.log('  [matched] ', entry.dn.toString())
  return result
}

function wrapNext(next) {
  return (err, ...args) => {
    if (err) console.error('  [error]   ', err.message)
    else console.log('  [success]')
    return next(err, ...args)
  }
}

async function run(next, operation) {
  try {
    return await operation(next)
  } catch (err) {
    console.error('  [error]   ', err.message)
    return next(new ldap.UnknownError(err.message))
  }
}

server.bind(base.dn, async (req, res, next) => {
  return run(next, async next => {
    logger.log('\n[bind] ', req.toString())
    next = wrapNext(next)

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
      console.log('  [matched] ', user.username, user.id)

      const {strategies} = user
      if (!(strategies.local && strategies.local.isVerified)) {
        return next(new ldap.InvalidCredentialsError("You must verify your e-mail address before logging in."))
      }
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
})

server.search(base.dn, authorize, async (req, res, next) => {
  return run(next, async next => {
    logger.log('\n[search] ', req.toString())
    next = wrapNext(next)

    if (matches(base, req)) res.send(base)
    if (matches(admin, req)) res.send(admin)
    if (matches(users, req)) res.send(users)
    if (matches(groups, req)) res.send(groups)

    await r.table('users')
      .filter({strategies: {local: {isVerified: true}}})
      .run().then(rUsers => rUsers.forEach(rUser => {
        const displayname = rUser.firstName || rUser.lastName
          ? [rUser.firstName, rUser.lastName].filter(i => Boolean(i)).join(' ')
          : rUser.username
        const attributes = {
          entryuuid: rUser.id,
          displayname,
          uid: rUser.username,
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
        if (matches(user, req)) {
          console.log('  [user]    ', rUser.username, rUser.id)
          res.send(user)
        }
      }))

    res.end()
    return next()
  })
})

server.listen(ldapConfig.port, () => {
  logger.log('LDAP server listening at %s', server.url)
})
