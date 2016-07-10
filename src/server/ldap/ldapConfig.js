import logger from '../logger'

function checkMissing(...envvars) {
  envvars.forEach(envvar => {
    if (!process.env[envvar]) {
      logger.error('missing environment variable: ', envvar)
      process.exit(1)
    }
  })
}

checkMissing([
  'LDAP_ADMIN_PASSWORD'
])

const config = {
  port: process.env.LDAP_PORT || 1389,
  baseDN: process.env.LDAP_BASE || 'dc=example,dc=org',
  usersOU: process.env.LDAP_USERS_OU || 'ou=users',
  groupsOU: process.env.LDAP_GROUPS_OU || 'ou=groups',
  adminCN: process.env.LDAP_ADMIN_CN,
  adminPassword: process.env.LDAP_ADMIN_PASSWORD,
  organization: process.env.LDAP_ORGANIZATION
}

config.base = {
  dn: config.baseDN,
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

config.adminDN = `${config.adminCN},${config.baseDN}`
config.admin = {
  dn: config.adminDN,
  objectclass: [
    'simpleSecurityObject',
    'organizationalRole'
  ],
  attributes: {
    cn: config.adminCN,
    description: 'LDAP administrator'
  }
}

config.usersDN = `${config.usersOU},${config.baseDN}`
config.users = {
  dn: config.usersDN,
  objectclass: ['organizationalUnit', 'top'],
  attributes: {
    ou: config.usersOU
  }
}

config.groupsDN = `${config.groupsOU},${config.baseDN}`
config.groups = {
  dn: config.groupsDN,
  objectclass: [
    'organizationalUnit',
    'top'
  ],
  attributes: {
    ou: config.groupsOU
  }
}

export default config
