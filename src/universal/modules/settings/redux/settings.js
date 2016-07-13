/* eslint-env browser */

import {fromJS, Map as iMap} from 'immutable'

import {fetchGraphQL} from '../../../utils/fetching'

export const FETCH_SETTINGS = 'FETCH_SETTINGS'
export const FETCH_SETTINGS_ERROR = 'FETCH_SETTINGS_ERROR'
export const FETCH_SETTINGS_SUCCESS = 'FETCH_SETTINGS_SUCCESS'

const initialState = iMap({
  error: undefined,
  fetching: false,
  current: iMap(),
})

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case FETCH_SETTINGS:
      return state.merge({
        fetching: true,
        error: iMap()
      })
    case FETCH_SETTINGS_ERROR:
      return state.merge({
        fetching: false,
        error: action.error
      })
    case FETCH_SETTINGS_SUCCESS:
      return state.merge({
        fetching: false,
        error: undefined,
        current: fromJS(action.payload)
      })
    default:
      return state
  }
}

const settings = `
{
  memberSpreadsheet {
    id,
    directorySheetId,
    journalSheetId
  }
}`

export function fetchSettings() {
  return async dispatch => {
    dispatch({type: FETCH_SETTINGS})
    const query = `
    query {
      payload: getSettings
      ${settings}
    }`
    const {error, data} = await fetchGraphQL({query})
    if (error) {
      dispatch({type: FETCH_SETTINGS_ERROR, error: error})
    } else {
      const {payload} = data
      dispatch({type: FETCH_SETTINGS_SUCCESS, payload})
    }
  }
}
