const config = {
  port: process.env.LDAP_PORT || 1389,
  base: process.env.LDAP_BASE || 'dc=example,dc=org',
  usersOU: process.env.LDAP_USERS_OU || 'ou=users',
  adminCN: process.env.LDAP_ADMIN_CN,
  adminPassword: process.env.LDAP_ADMIN_PASSWORD,
  organization: process.env.LDAP_ORGANIZATION,
}

config.baseEntry = {
  dn: config.base,
  objectclass: [
    'top',
    'dcObject',
    'organization'
  ],
  attributes: {
    // TODO: dc
    o: config.organization
  }
}

config.adminDN = `${config.adminCN},${config.base}`
config.usersDN = `${config.usersOU},${config.base}`
config.usersEntry = {
  dn: config.usersDN,
  objectclass: ['organizationalUnit', 'top'],
  attributes: {
    ou: config.usersOU
  }
}

export default config
