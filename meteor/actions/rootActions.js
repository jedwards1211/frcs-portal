import {createAction} from 'redux-actions'

export const INITIALIZE = 'INITIALIZE'
export const STOP = 'STOP'
export const LOGIN = 'LOGIN'
export const LOGOUT = 'LOGOUT'
export const SET_USER = 'SET_USER'

export const initialize = createAction(INITIALIZE)
export const stop = createAction(STOP)

export function login(username, password) {
  return {
    type: LOGIN,
    payload: {
      username,
      password,
    }
  }
}

export const logout = createAction(LOGOUT)
export const setUser = createAction(SET_USER)
