/* @flow */

import {createReducer, composeReducers} from 'mindfront-redux-utils';

import type {Reducer} from '../flowtypes/reduxTypes';
import * as actions from './DocumentViewActions';

function createSetter(field: string): Reducer {
  return (state, action) => state.setIn([...action.meta.reduxPath, field], action.payload); 
}

export default createReducer({
  [actions.SET_DOCUMENT]: composeReducers(createSetter('document'), createSetter('initDocument')),
  [actions.SET_ASK_TO_LEAVE]: createSetter('askToLeave'),
  [actions.SET_DELETING]: createSetter('deleting'),
  [actions.SET_SAVING]: createSetter('saving'),
  [actions.SET_SAVE_ERROR]: createSetter('saveError')
});
