/* @flow */

import combineImmutableReducers from '../../reducers/combineImmutableReducers';

import {createPayloadReducer} from '../../reducers/commonReducers';

import * as actions from '../actions/changePasswordActions';

export default combineImmutableReducers({
  changingPassword:     createPayloadReducer(false,     actions.SET_CHANGING_PASSWORD),
  changePasswordError:  createPayloadReducer(undefined, actions.SET_CHANGE_PASSWORD_ERROR)
});
