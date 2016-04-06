/* @flow */

import Immutable from 'immutable';
import {createAction} from 'redux-actions';

import type {Action} from '../../flowtypes/reduxTypes';

export const LOGIN_WITH_PASSWORD = 'METEOR.LOGIN_WITH_PASSWORD';
export const LOGOUT = 'METEOR.LOGOUT';
export const SET_USER = 'METEOR.SET_USER';
export const SET_LOGGING_IN = 'METEOR.SET_LOGGING_IN';
export const SET_LOGIN_ERROR = 'METEOR.SET_LOGIN_ERROR';
export const SET_LOGOUT_ERROR = 'METEOR.SET_LOGOUT_ERROR';

export function loginWithPassword(username: string, password: string): Action {
  return {
    type: LOGIN_WITH_PASSWORD,
    payload: {
      username,
      password
    }
  };
}

export const logout: () => Action = createAction(LOGOUT);
export const setUser: (user: ?Immutable.Map) => Action = createAction(SET_USER);
export const setLoggingIn: (logginIn: boolean) => Action = createAction(SET_LOGGING_IN);
export const setLoginError: (error: ?Error) => Action = createAction(SET_LOGIN_ERROR);
export const setLogoutError: (error: ?Error) => Action = createAction(SET_LOGOUT_ERROR);
