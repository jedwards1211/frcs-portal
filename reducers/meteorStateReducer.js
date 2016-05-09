import * as Immutable from 'immutable';

import {createReducer} from 'mindfront-redux-utils';

import { setOrDelete } from '../utils/ImmutableUtils';
import {SET_METEOR_STATE} from '../meteor/actions/meteorActions';

export default createReducer(Immutable.Map(), {
  [SET_METEOR_STATE](state, action) {
    let {payload} = action;
    payload = Immutable.Map(payload);
    return state ? setOrDelete(state, payload) : payload;
  },
});
