/* @flow */

import type {SubscriptionHandle} from '../flowtypes/meteorTypes';
import type {Action} from '../flowtypes/reduxTypes';

export const TYPE_PREFIX = 'METEOR.';
export const SET_SUBSCRIPTION = TYPE_PREFIX + 'SET_SUBSCRIPTION';
export const SET_SUBSCRIPTION_STATUS = TYPE_PREFIX + 'SET_SUBSCRIPTION_STATUS';
export const DELETE_SUBSCRIPTION_STATUS = TYPE_PREFIX + 'DELETE_SUBSCRIPTION_STATUS';

type Key = string | number | Symbol;

export function setSubscription(key: Key, subscription: SubscriptionHandle): Action {
  return {
    type: SET_SUBSCRIPTION,
    payload: subscription,
    meta: {key}
  };
}

export function setSubscriptionStatus(key: Key, status: {ready?: boolean, error?: Error}): Action {
  return {
    type: SET_SUBSCRIPTION_STATUS,
    payload: status,
    meta: {key}
  };
}

export function deleteSubscriptionStatus(key: Key): Action {
  return {
    type: DELETE_SUBSCRIPTION_STATUS,
    meta: {key}
  };
}
