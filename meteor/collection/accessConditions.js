/* @flow */

import _ from 'lodash';

import {hasUserRoles} from '../requireUserRoles';

import type {Condition} from './accessRules';

/**
 * A condition that applies when the user is logged in.
 */
export const userIsLoggedIn: Condition = ({options}) => getUserId(options) != null;
/**
 * @returns condition that applies when the user's id is one of the given userIds.
 */
export function userIn(...userIds: string[]): Condition {
  const idMap = {};
  userIds.forEach(userId => idMap[userId] = true);
  return ({options}) => {
    const userId = getUserId(options);
    return !!(userId && idMap[userId]);
  };
}
/**
 * @returns a condition that only applies when the user has the given role.
 */
export function userHasRole(role: string): Condition {
  return userHasAnyRole(role);
}
/**
 * @returns a condition that applies when the user has any of the given roles.
 */
export function userHasAnyRole(...roles: string[]): Condition {
  return ({options}) => {
    const userId = getUserId(options);
    return !!userId && _.some(roles, role => hasUserRoles(userId, role));
  };
}
/**
 * @returns a condition that applies when the user has all of the given roles.
 */
export function userHasAllRoles(...roles: string[]): Condition {
  return ({options}) => {
    const userId = getUserId(options);
    return !!userId && hasUserRoles(userId, roles);
  };
}

function getUserId(options: Object): ?string {
  return options.userId || Meteor.userId();
}
