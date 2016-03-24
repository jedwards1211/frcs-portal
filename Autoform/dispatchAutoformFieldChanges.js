/* @flow */

import type {Dispatch} from '../flowtypes/reduxTypes';
import {SET_FIELD} from './AutoformConstants';
import type {AutoformFieldChangeCallback} from './AutoformTypes';

/**
 * Creates an onAutoformFieldChange callback that dispatches corresponding actions to a redux store.
 *
 * dispatch: a redux dispatch function
 * options.meta: meta to add to the actions dispatched action.
 */
export function dispatchAutoformFieldChanges(dispatch: Dispatch, options?: {meta?: Object})
: AutoformFieldChangeCallback {
  let meta = options && options.meta;
  return (autoformField, newValue, options) => {
    let {autoformPath} = options || {};
    dispatch({
      type: SET_FIELD,
      payload: newValue,
      meta: {
        ...(meta || {}),
        autoformField,
        autoformPath
      }
    });
  }
}
