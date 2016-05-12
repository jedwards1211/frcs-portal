/* @flow */

import combineImmutableReducers from '../../reducers/combineImmutableReducers'

import {createPayloadReducer} from '../../reducers/commonReducers'

import * as actions from '../actions/userActions'

export default combineImmutableReducers({
  user:                 createPayloadReducer(undefined,       actions.SET_USER),
  loggingIn:            createPayloadReducer(false,           actions.SET_LOGGING_IN),
  loginError:           createPayloadReducer(undefined,       actions.SET_LOGIN_ERROR),
  logoutError:          createPayloadReducer(undefined,       actions.SET_LOGOUT_ERROR)
})
