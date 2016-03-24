/* @flow */

import {SET_FIELD} from './AutoformConstants';
import {createReducer} from 'mindfront-redux-utils';

export default createReducer({
  [SET_FIELD]: (state, action) => {
    let {payload, meta: {reduxPath, autoformPath, autoformField}} = action;
    return state.setIn([...(reduxPath || []), ...(autoformPath || []), autoformField], payload);
  }
});
