

import r from '../database/rethinkdriver'
import ldap from 'ldapjs'
import ldapConfig from './ldapConfig'

const {adminDN, adminPassword, usersDN, usersEntry} = ldapConfig

const server = ldap.createServer()

function authorize(req, res, next) {
  /* Any user may search after bind, only cn=root has full power */
  if (!req.connection.ldap.bindDN.equals(adminDN))
    return next(new ldap.InsufficientAccessRightsError())

  return next()
}

server.bind(ldapConfig.base, (req, res, next) => {
  if (req.dn.equals(adminDN)) {
    if (req.credentials !== adminPassword) return next(new ldap.InvalidCredentialsError())
  }
  else {
    return next(new ldap.InvalidCredentialsError())
  }
  
  res.end()
  return next()
})

server.search(ldapConfig.base, authorize, async (req, res, next) => {
  // TODO need to check the req base
  
  if (req.filter.matches(usersEntry)) res.send(usersEntry)
  
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
    if (req.filter.matches(userEntry)) res.send(userEntry)
  }))
  
  res.end()
  return next()
})

server.listen(ldapConfig.port, function() {
  console.log('LDAP server listening at %s', server.url)
})
