/* @flow */

import Immutable from 'immutable';
import _ from 'lodash';

function toMap(list: ?string | ?string[]) {
  let result = {};
  if (typeof list === 'string') {
    result[list] = true;
  }
  else if (list instanceof Array) {
    list.forEach(key => result[key] = true);
  }
  return result;
}

type User = string | {_id: string};

export default function createACLChecker(options: {
  user?: User,
  groups?: string | string[],
  roles?: string | string[],
  permissions: string | string[],
  partition?: string,
  throws?: boolean
}): {
  (document: Object | Immutable.Iterable.Keyed): {
    allowed: boolean,
    permissions: {[permission: string]: boolean}
  };
  permissions: {[permission: string]: true}
} {
  let {user, partition, throws} = options;

  if (!options.permissions || !options.permissions.length) {
    throw new Error("you must specify at least one permission");
  }

  let groups = toMap(options.groups);
  let roles = toMap(options.roles);
  let permissions = toMap(options.permissions);

  groups.everyone = true;

  let result = doc => {
    let document = doc instanceof Immutable.Map ? {
      owner: doc.get('owner'),
      acl: doc.get('acl').toJS()
    } : doc;

    let {acl, owner} = document;
    let satisfiedPermissions = _.mapValues(permissions, () => false);

    if (acl) {
      let missingPermissionCount = _.size(permissions);

      for (let entry of acl) {
        if ((entry.partition === partition || !entry.partition) && 
            (entry.user === user || groups[entry.group] || roles[entry.role] ||
            (owner === user && entry.group === 'owner'))) {
          if (!satisfiedPermissions[entry.permission]) {
            satisfiedPermissions[entry.permission] = true;
            if (--missingPermissionCount === 0) {
              return {
                allowed: true,
                permissions: satisfiedPermissions
              };
            }
          }
        }
      }
    }
    if (throws) {
      throw new Meteor.Error(403, `You don't have permission to ${
        Object.keys(_.filter(satisfiedPermissions, satisfied => !satisfied)).join(', ')
      } on this document`);
    }
    return {
      allowed: false,
      permissions: satisfiedPermissions
    };
  };
  result.permissions = permissions;
  return result;
}