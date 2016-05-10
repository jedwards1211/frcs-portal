/* @flow */

import * as Immutable from 'immutable';
import {createReducer} from 'mindfront-redux-utils';

import * as actions from './../actions/meteorSubcriptionActions';

export default createReducer(Immutable.Map(), {
  [actions.SET_SUBSCRIPTION_STATUS]: (state, action) => state.mergeIn(['subscriptions', action.meta.key], action.payload),
  [actions.DELETE_SUBSCRIPTION_STATUS]: (state, action) => state.deleteIn(['subscriptions', action.meta.key])
});
