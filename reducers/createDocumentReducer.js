/* @flow */

import {createReducer} from 'mindfront-redux-utils';
import _ from 'lodash';

import type {Reducer} from '../flowtypes/reduxTypes';

function createSetter(field: string): Reducer {
  return (state, action) => state.setIn([...action.meta.reduxPath, 'document', 
    ...(action.meta.autoformPath || []), field], action.payload);
}

export default function createDocumentReducer(fields: string[], typePrefix?: string): Reducer {
  let actionHandlers = {};
  fields.forEach(field => {
    actionHandlers[(typePrefix || '') + 'SET_' + _.snakeCase(field).toUpperCase()] = createSetter(field); 
  });

  return createReducer(actionHandlers);
}
