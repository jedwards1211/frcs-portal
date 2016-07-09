

import r from '../database/rethinkdriver'
import ldap from 'ldapjs'
import ldapConfig from './ldapConfig'

const {adminDN, adminPassword} = ldapConfig

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

server.search(ldapConfig.base, authorize, (req, res, next) => {
  r.table('users').run().then(console.log)
  res.end()
  return next()
})

server.listen(ldapConfig.port, function() {
  console.log('LDAP server listening at %s', server.url)
})
