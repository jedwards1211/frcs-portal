/* @flow */

import _ from 'lodash';

export default function requireUserRoles(userId: string, roles: string | string[]) {
  let normRoles = roles instanceof Array ? roles : [roles];
  let user = Meteor.users.findOne({_id: userId}, {roles: 1});
  if (!user) {
    throw new Meteor.Error(401, 'Not authorized');
  }
  if (_.difference(normRoles, user.roles || []).length) {
    throw new Meteor.Error(403, 'Forbidden');
  }
}

export function hasUserRoles(userId: string, roles: string | string[]) : boolean {
  try {
    requireUserRoles(userId, roles);
    return true;
  } catch (err) {
    return false;
  }
}