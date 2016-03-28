/* @flow */

import type {Dispatch} from '../flowtypes/reduxTypes';
import type {AutoformFieldChangeCallback} from './AutoformTypes';
import _ from 'lodash';

/**
 * Creates an onAutoformFieldChange callback that dispatches corresponding actions to a redux store.
 *
 * dispatch: a redux dispatch function
 * options.meta: meta to add to the actions dispatched action.
 */
export default function dispatchAutoformFieldChanges(dispatch: Dispatch, 
                                                     options?: {meta?: Object, actionTypePrefix?: string})
: AutoformFieldChangeCallback {
  let {meta, actionTypePrefix} = options || {};
  return (autoformField, newValue, options) => {
    let type = 'SET_' + _.snakeCase(autoformField).toUpperCase();
    if (actionTypePrefix) type = actionTypePrefix + type;
    let {autoformPath} = options || {};
    dispatch({
      type,
      payload: newValue,
      meta: {
        ...(meta || {}),
        autoformField,
        autoformPath
      }
    });
  }
}
