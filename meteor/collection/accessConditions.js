/* @flow */

import type {Condition} from './accessRules'
import getUserId from './getUserId'

/**
 * A condition that applies when the user is logged in.
 */
export const userIsLoggedIn: Condition = (operation) => getUserId(operation) != null
/**
 * @returns condition that applies when the user's id is one of the given userIds.
 */
export function userIn(...userIds: string[]): Condition {
  const idMap = {}
  userIds.forEach(userId => idMap[userId] = true)
  return (operation) => {
    const userId = getUserId(operation)
    return !!(userId && idMap[userId])
  }
}
