/* @flow */

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


function getUserId(options: Object): ?string {
  return options.userId || Meteor.userId();
}
