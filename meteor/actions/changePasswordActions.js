/* @flow */

import {createAction} from 'redux-actions'

import type {Action} from '../../flowtypes/reduxTypes'

export const SET_CHANGING_PASSWORD = 'METEOR.SET_CHANGING_PASSWORD'
export const SET_CHANGE_PASSWORD_ERROR = 'METEOR.SET_CHANGE_PASSWORD_ERROR'

export const setChangingPassword: (changingPassword: boolean) => Action = createAction(SET_CHANGING_PASSWORD)
export const setChangePasswordError: (error: ?Error) => Action = createAction(SET_CHANGE_PASSWORD_ERROR)
