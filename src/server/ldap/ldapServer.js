import r from '../database/rethinkdriver'
import ldap, {parseDN} from 'ldapjs'
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
    if (err) console.error('  [error]   ', err.message, err.stack)
    else console.log('  [success]')
    return next(err, ...args)
  }
}

async function run(next, operation) {
  try {
    return await operation(next)
  } catch (err) {
    console.error('  [error]   ', err.message, err.stack)
    return next(new ldap.UnknownError(err.message))
  }
}

const parsedUsersDN = parseDN(users.dn)
const parsedGroupsDN = parseDN(groups.dn)

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
      if (!req.dn.rdns[0].attrs.uid) return next(new ldap.InvalidCredentialsError())
      const uid = req.dn.rdns[0].attrs.uid.value

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

    if (parsedUsersDN.childOf(req.dn) || req.dn.childOf(parsedUsersDN) || req.dn.equals(parsedUsersDN)) {
      let usersQuery = r.table('users')

      if (req.dn.childOf(users.dn)) {
        const uidObj = req.dn.rdns[0].attrs.uid
        const uid = uidObj && uidObj.value
        if (uid) usersQuery = usersQuery.getAll(uid, {index: 'username'}).limit(1)
      }
      const rUsers = await usersQuery.merge(user => ({
        gidnumber: r.table('users_groups')
          .getAll(user('id'), {index: 'user_id'})
          .eqJoin('group_id', r.table('groups'))
          .zip()
          .max('gidnumber')('gidnumber'),
        groupnames: r.table('users_groups')
          .getAll(user('id'), {index: 'user_id'})
          .eqJoin('group_id', r.table('groups'))
          .zip()
          .map(g => g('groupname'))
          .coerceTo('array')
      })).run()

      rUsers.forEach(rUser => {
        const displayname = rUser.firstName || rUser.lastName
          ? [rUser.firstName, rUser.lastName].filter(i => Boolean(i)).join(' ')
          : rUser.username
        const attributes = {
          entryuuid: rUser.id,
          displayname,
          uid: rUser.username,
          uidnumber: rUser.uidnumber,
          mail: rUser.email,
          loginshell: 'bash',
          homedirectory: `/home/${rUser.username}`
        }
        if (rUser.gidnumber) attributes.gidnumber = rUser.gidnumber
        if (rUser.groupnames.length) {
          attributes.memberOf = [
            ...rUser.groupnames.map(groupname => `cn=${groupname},${groups.dn}`),
          ]
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
      })
    }

    if (parsedGroupsDN.childOf(req.dn) || req.dn.childOf(parsedGroupsDN) || req.dn.equals(parsedGroupsDN)) {
      let groupsQuery = r.table('groups')

      if (req.dn.childOf(groups.dn)) {
        const cnObj = req.dn.rdns[0].attrs.cn
        const cn = cnObj && cnObj.value
        if (cn) groupsQuery = groupsQuery.getAll(cn, {index: 'groupname'}).limit(1)
      }
      const rGroups = await groupsQuery.merge(group => ({
        members: r.table('users_groups')
          .getAll(group('id'), {index: 'group_id'})
          .eqJoin('user_id', r.table('users'))
          .zip()
          .map(u => u('username'))
          .coerceTo('array')
      })).run()

      rGroups.forEach(rGroup => {
        const attributes = {
          entryuuid: rGroup.id,
          cn: rGroup.groupname,
          gidnumber: rGroup.gidnumber,
        }
        if (rGroup.members.length) {
          attributes.memberuid = rGroup.members.map(member => `uid=${member},${users.dn}`)
        }
        const group = {
          dn: `cn=${rGroup.groupname},${groups.dn}`,
          objectclass: [
            'posixGroup',
            'top'
          ],
          attributes,
          ...attributes
        }
        if (matches(group, req)) {
          console.log('  [group]   ', rGroup.groupname, rGroup.id)
          res.send(group)
        }
      })
    }

    res.end()
    return next()
  })
})

server.listen(ldapConfig.port, () => {
  logger.log('LDAP server listening at %s', server.url)
})
