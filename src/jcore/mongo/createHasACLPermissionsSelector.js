/* @flow */

import type {Selector} from '../flowtypes/meteorTypes'

type User = string | {_id: string};

/**
 * Creates a selector that selects all documents that have all of the given permissions for at least one of the
 * given user, groups, and roles (and within a specific partition if given).
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
 * @returns a Mongo selector.
 */
export default function createACLSelector(options: {
  user?: User,
  groups?: string | string[],
  roles?: string | string[],
  permissions: string | string[],
  partition?: string
}): Selector {
  let {user, groups, roles, permissions, partition} = options

  if (!permissions || !permissions.length) {
    throw new Error("you must specify at least one permission")
  }

  if (!(roles instanceof Array)) roles = roles ? [roles] : []
  if (!(groups instanceof Array)) groups = groups ? [groups] : []
  if (!(permissions instanceof Array)) permissions = [permissions]

  // make sure to get any documents with the given permissions applying to the everyone pseudogroup
  groups.push('everyone')

  if (user) {
    let roles = Roles.getRolesForUser(user)
    if (roles) {
      roles = [...roles, roles]
    }
  }

  let $or: Object[] = []

  let userId = user instanceof Object ? user._id : typeof user === 'string' ? user : undefined

  if (userId) $or.push({user: userId})
  if (groups.length) $or.push({group: groups.length > 1 ? {$in: groups} : groups[0]})
  if (roles.length) $or.push({role: roles.length > 1 ? {$in: roles} : roles[0]})

  let $elemMatch: Object = {$or}
  if (partition) $elemMatch.partition = partition

  let selector = {
    acl: {
      // this works even if the permissions are satisfied by a mix of user, groups and/or roles
      $all: permissions.map(permission => ({$elemMatch: {...$elemMatch, permission}}))
    }
  }

  if (userId) {
    // get any documents owned by given user with the given permissions applying to the owner pseudogroup
    selector = {
      $or: [
        selector,
        {
          owner: userId,
          acl: {
            // this works even if the permissions are satisfied by a mix of user, groups and/or roles
            $all: selector.acl.$all.map(s => ({
              $elemMatch: {
                ...s.$elemMatch,
                $or: [...s.$elemMatch.$or, {group: 'owner'}]
              }
            }))
          }
        }
      ]
    }
  }

  return selector
}
