/* @flow */

import _ from 'lodash';

export default function requireUserRoles(userId: string, roles: string | string[]) {
  let normRoles = roles instanceof Array ? roles : [roles];
  let user;
  if (userId === Meteor.userId()) {
    user = Meteor.user();
  }  
  else {
    user = Meteor.users.find({_id: userId}, {roles: 1}).fetch();
  }
  if (!user) {
    throw new Meteor.Error(401, 'Not authorized');
  }
  if (_.difference(normRoles, user.roles || []).length) {
    throw new Meteor.Error(403, 'Forbidden');
  }
}
