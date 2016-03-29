/* @flow */

import _ from 'lodash';

import type {Action} from '../flowtypes/reduxTypes';

/**
 * Creates an onAutoformFieldChange callback that dispatches corresponding actions to a redux store.
 *
 * dispatch: a redux dispatch function
 * options.meta: meta to add to the actions dispatched action.
 */
export function setField(autoformField: string,
                         newValue: any,
                         options?: {
                           meta?: Object,
                           actionTypePrefix?: string,
                           autoformPath?: Array<string | number>
                         }): Action {
  let {meta, actionTypePrefix} = options || {};
  let type = 'SET_' + _.snakeCase(autoformField).toUpperCase();
  if (actionTypePrefix) type = actionTypePrefix + type;
  let {autoformPath} = options || {};
  return {
    type,
    payload: newValue,
    meta: {
      ...(meta || {}),
      autoformField,
      autoformPath
    }
  };
}
