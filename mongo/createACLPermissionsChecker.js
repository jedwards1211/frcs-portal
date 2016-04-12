/* @flow */

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
  permissions: string | string[]
}): (document: Object) => void {
  let {user} = options;

  if (!options.permissions || !options.permissions.length) {
    throw new Error("you must specify at least one permission");
  }

  let groups = toMap(options.groups);
  let roles = toMap(options.roles);
  let permissions = toMap(options.permissions);

  groups.everyone = true;

  return document => {
    let {acl} = document;
    if (acl) {
      let missingPermissions = {...permissions};
      let missingPermissionCount = _.size(missingPermissions);
      for (let entry of acl) {
        if (entry.user === user || groups[entry.group] || roles[entry.role] ||
            (document.owner === user && entry.group === 'owner')) {
          if (missingPermissions[entry.permission]) {
            missingPermissions[entry.permission] = undefined;
            if (--missingPermissionCount === 0) {
              return;
            }
          }
        }
      }
      throw new Meteor.Error(403, `You don't have permission to ${Object.keys(permissions).join(', ')} on this document`);
    }
  };
}