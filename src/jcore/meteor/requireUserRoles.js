/* @flow */

export default function requireUserRoles(userId: string, roles: string | string[]) {
  const normRoles = Array.isArray(roles) ? roles : [roles]
  if (!userId) {
    throw new Meteor.Error(401, "Unauthorized")
  }
  if (!Roles.userIsInRole(userId, ...normRoles)) {
    throw new Meteor.Error(403, 'Forbidden')
  }
}
