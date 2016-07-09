import getUserId from './getUserId'

import type {Condition} from './accessRules'

import createACLPermissionsChecker from '../../mongo/createACLPermissionsChecker'

const PERMISSIONS = {
  find: 'read',
  findOne: 'read',
  update: 'write',
  upsert: 'write',
  remove: 'remove'
}

/**
 * Throws if the given operation is not allowed by the access control list of any document it would read, write, or
 * remove.
 */
const hasACLPermissions: Condition = operation => {
  if (Meteor.isServer) {
    let userId = getUserId(operation)

    let {collection, method, selector, options} = operation

    if (method === 'insert') {
      return true
    }

    let checkDocument = createACLPermissionsChecker({
      user: userId,
      permissions: PERMISSIONS[method],
      throws: true
    })

    if (method === 'findOne') {
      let document = collection.findOne(selector, options && {
        ...options,
        fields: options.fields && {...options.fields, acl: 1, owner: 1}
      })
      if (document) checkDocument(document)
    }
    else {
      collection.find(selector, options && {
        ...options,
        fields: options.fields && {...options.fields, acl: 1, owner: 1}
      }).forEach(checkDocument)
    }
  }
  return true
}

export default hasACLPermissions
