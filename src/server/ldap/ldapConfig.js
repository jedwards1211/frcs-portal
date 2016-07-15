import logger from '../logger'

function checkMissing(...envvars) {
  envvars.forEach(envvar => {
    if (!process.env[envvar]) {
      logger.error('missing environment variable: ', envvar)
      process.exit(1)
    }
  })
}

checkMissing(
  'LDAP_ADMIN_PASSWORD',
  'LDAP_ORGANIZATION'
)

const config = {
  port: process.env.LDAP_PORT || 1389,
  baseDN: process.env.LDAP_BASE_DN || 'dc=example,dc=org',
  usersOU: process.env.LDAP_USERS_OU || 'users',
  groupsOU: process.env.LDAP_GROUPS_OU || 'groups',
  ocgroupsOU: process.env.LDAP_OCGROUPS_OU || 'ocgroups',
  adminCN: process.env.LDAP_ADMIN_CN || 'admin',
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
  o: config.organization,
  attributes: {
    // TODO: dc
    o: config.organization
  }
}

config.adminDN = `cn=${config.adminCN},${config.baseDN}`
config.admin = {
  dn: config.adminDN,
  objectclass: [
    'simpleSecurityObject',
    'organizationalRole'
  ],
  cn: config.adminCN,
  attributes: {
    cn: config.adminCN,
    description: 'LDAP administrator'
  }
}

config.usersDN = `ou=${config.usersOU},${config.baseDN}`
config.users = {
  dn: config.usersDN,
  objectclass: ['organizationalUnit', 'top'],
  ou: config.usersOU,
  attributes: {
    ou: config.usersOU
  }
}

config.groupsDN = `ou=${config.groupsOU},${config.baseDN}`
config.groups = {
  dn: config.groupsDN,
  objectclass: [
    'organizationalUnit',
    'top'
  ],
  ou: config.groupsOU,
  attributes: {
    ou: config.groupsOU
  }
}

config.ocgroupsDN = `ou=${config.ocgroupsOU},${config.baseDN}`
config.ocgroups = {
  dn: config.ocgroupsDN,
  objectclass: [
    'organizationalUnit',
    'top'
  ],
  ou: config.ocgroupsOU,
  attributes: {
    ou: config.ocgroupsOU
  }
}

export default config
