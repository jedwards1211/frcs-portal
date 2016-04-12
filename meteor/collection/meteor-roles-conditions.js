/* @flow */

import _ from 'lodash';

import type {Condition} from './accessRules';
import {getUserId} from './getUserId';

/**
 * @returns a condition that only applies when the user has the given role.
 */
export function userHasRole(role: string): Condition {
  return userHasAnyRole(role);
}
/**
 * @returns a condition that applies when the user has any of the given roles.
 */
export function userHasAnyRole(roles: string | string[], 
                               options?: {
                                 partition?: string,
                                 anyPartition?: boolean 
                               }): Condition {
  return (args) => {
    const userId = getUserId(args);
    return !!userId && Roles.userIsInRole(userId, roles, options);
  };
}

/**
 * @returns a condition that applies when the user has all of the given roles.
 */
export function userHasAllRoles(roles: string | string[],
                                options?: {
                                  partition?: string,
                                  anyPartition?: boolean
                                }): Condition {
  return (args) => {
    const userId = getUserId(args);
    return !!userId && _.every(roles, role => Roles.userIsInRole(userId, role, options));
  };
}