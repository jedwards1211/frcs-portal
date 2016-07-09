/* @flow */

import * as Immutable from 'immutable'
import _ from 'lodash'

function toMap(list: ?string | ?string[]) {
  let result = {}
  if (typeof list === 'string') {
    result[list] = true
  }
  else if (list instanceof Array) {
    list.forEach(key => result[key] = true)
  }
  return result
}

type User = string | {_id: string};

/**
 * Creates a function that checks if a document has the given permissions for the given user, groups, and roles
 * (and within a specific partition if given) in its `acl` (access control list) property.
 *
 * If a user is given, permissions for the user's roles will also be checked.
 *
 * Note that all users are considered to be in the "everyone" pseudogroup, and the "owner" pseudogroup permissions
 * apply to the owner of a document.
 *
 * @param{(string|Object)=}   options.user - a userId or user document
 * @param{(string|string[])=} options.groups - one or more groups
 * @param{(string|string[])}  options.permissions - the permissions
 * @param{string=}            options.partition - if given, only permission entries in this partition (or the global
 *                                                partition) count
 * @returns a function that accepts
 */
export default function createACLChecker(options: {
  user?: User,
  groups?: string | string[],
  roles?: string | string[],
  permissions?: string | string[],
  partition?: string,
  throws?: boolean,
  returnAllPermissions?: boolean
}): {
  (document: Object | Immutable.Iterable.Keyed): {
    allowed: boolean,
    permissions: {[permission: string]: boolean}
  };
  permissions: {[permission: string]: true}
} {
  let {user, partition, throws, returnAllPermissions} = options

  let groups = toMap(options.groups)
  let roles = toMap(options.roles)
  let requiredPermissions = toMap(options.permissions)

  if (user) {
    let userRoles = Roles.getRolesForUser(user)
    if (userRoles) userRoles.forEach(role => roles[role] = true)
  }

  groups.everyone = true

  let result = doc => {
    let document: Object = {}
    if (doc instanceof Immutable.Iterable) {
      document = {
        owner: doc.get('owner'),
        acl: doc.get('acl').toJS()
      }
    }
    else if (doc instanceof Object) {
      document = doc
    }

    let {acl, owner} = document
    let permissions = _.mapValues(requiredPermissions, () => false)

    let missingPermissionCount = _.size(requiredPermissions)
    if (acl) {
      for (let entry of acl) {
        if ((entry.partition === partition || !entry.partition) &&
            (entry.user === user || groups[entry.group] || roles[entry.role] ||
            (owner === user && entry.group === 'owner'))) {
          if (permissions[entry.permission] === false) {
            if (--missingPermissionCount === 0 && !returnAllPermissions) {
              permissions[entry.permission] = true
              break
            }
          }
          permissions[entry.permission] = true
        }
      }
    }
    if (missingPermissionCount <= 0) {
      return {
        allowed: true,
        permissions
      }
    }
    if (throws) {
      throw new Meteor.Error(403, `You don't have permission to ${
        Object.keys(_.pickBy(permissions, satisfied => !satisfied)).join(', ')
      } on this document`)
    }
    return {
      allowed: false,
      permissions
    }
  }
  result.permissions = requiredPermissions
  return result
}
