import r from '../database/rethinkdriver'
import ldap from 'ldapjs'
import ldapConfig from './ldapConfig'

const {baseDN, baseEntry, 
  adminDN, adminEntry, adminPassword, 
  usersDN, usersEntry} = ldapConfig

const server = ldap.createServer()

function authorize(req, res, next) {
  /* Any user may search after bind, only cn=root has full power */
  if (!req.connection.ldap.bindDN.equals(adminDN))
    return next(new ldap.InsufficientAccessRightsError())

  return next()
}

function matches(entry, req) {
  if (req.scope === 'sub' && req.dn.parentOf(entry.dn)) return true
  return req.dn.equals(entry.dn)
}

server.bind(baseDN, (req, res, next) => {
  if (req.dn.equals(adminDN)) {
    if (req.credentials !== adminPassword) return next(new ldap.InvalidCredentialsError())
  }
  else {
    return next(new ldap.InvalidCredentialsError())
  }
  
  res.end()
  return next()
})

server.search(baseDN, authorize, async (req, res, next) => {
  if (matches(baseEntry, req)) res.send(baseEntry)
  if (matches(adminEntry, req)) res.send(adminEntry)
  if (matches(usersEntry, req)) res.send(usersEntry)
  
  await r.table('users').run().then(users => users.forEach(user => {
    const uid = user.email.split('@')[0]
    const userEntry = {
      dn: `uid=${uid},${usersDN}`,
      objectclass: [
        'inetOrgPerson',
        'posixAccount',
        'top'
      ],
      attributes: {
        uid,
        gidnumber: 500,
        mail: user.email
      }
    }
    if (matches(userEntry, req)) res.send(userEntry)
  }))
  
  res.end()
  return next()
})

server.listen(ldapConfig.port, function() {
  console.log('LDAP server listening at %s', server.url)
})
