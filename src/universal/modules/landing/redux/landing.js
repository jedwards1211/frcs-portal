export const SET_SHOW_MENU = 'SET_SHOW_MENU'

import {Map as iMap} from 'immutable'

const initialState = iMap({
  showMenu: false
})

export default function landingReducer(state = initialState, action) {
  switch (action.type) {
    case SET_SHOW_MENU:
      return state.set('showMenu', action.payload)
    default:
      return state
  }
}

export function setShowMenu(showMenu) {
  return {
    type: SET_SHOW_MENU,
    payload: showMenu
  }
}
