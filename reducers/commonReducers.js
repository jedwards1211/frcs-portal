import {createReducer} from 'mindfront-redux-utils';

export function createPayloadReducer(initialState, actionType) {
  if (arguments.length === 1) {
    initialState = undefined;
    actionType = arguments[0];
  }
  return createReducer(initialState, {
    [actionType]: (state, action) => action.payload
  });
}

export function createMergeReducer(initialState, actionType) {
  if (arguments.length === 1) {
    initialState = undefined;
    actionType = arguments[0];
  }
  return createReducer(initialState, {
    [actionType]: (state, action) => state.merge(action.payload)
  });
}
