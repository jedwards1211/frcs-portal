/* @flow */

import _ from 'lodash';

import type {Action} from '../flowtypes/reduxTypes';

/**
 * Creates an onAutobindFieldChange callback that dispatches corresponding actions to a redux store.
 *
 * dispatch: a redux dispatch function
 * options.meta: meta to add to the actions dispatched action.
 */
export function setField(autobindField: string | number,
                         newValue: any,
                         options?: {
                           meta?: Object,
                           actionTypePrefix?: string,
                           autobindPath?: Array<string | number>
                         } = {}): Action {
  let {meta, actionTypePrefix} = options;
  let type = 'SET_' + _.snakeCase(autobindField).toUpperCase();
  if (actionTypePrefix) type = actionTypePrefix + type;
  let {autobindPath} = options || {};
  return {
    type,
    payload: newValue,
    meta: Object.assign({
      autobindField,
      autobindPath
    }, meta)
  };
}
