export const ACTION_TYPE_PREFIX = 'CALIBRATION_WIZARD'
export const SET_NUM_POINTS = ACTION_TYPE_PREFIX + 'SET_NUM_POINTS'
export const SET_INPUT_VALUE = ACTION_TYPE_PREFIX + 'SET_INPUT_VALUE'
export const SET_OUTPUT_VALUE = ACTION_TYPE_PREFIX + 'SET_OUTPUT_VALUE'
export const DELETE_POINT = ACTION_TYPE_PREFIX + 'DELETE_POINT'
export const GO_TO_EDIT_MANUALLY = ACTION_TYPE_PREFIX + 'GO_TO_EDIT_MANUALLY'
export const ADD_POINT = ACTION_TYPE_PREFIX + 'ADD_POINT'
export const BACK = ACTION_TYPE_PREFIX + 'BACK'
export const NEXT = ACTION_TYPE_PREFIX + 'NEXT'
export const APPLY = ACTION_TYPE_PREFIX + 'APPLY'
export const CANCEL = ACTION_TYPE_PREFIX + 'CANCEL'

export function setNumPoints(value, reduxPath) {
  return {
    type: SET_NUM_POINTS,
    payload: value,
    meta: {reduxPath}
  }
}

export function setInputValue(pointIndex, value, reduxPath) {
  return {
    type: SET_INPUT_VALUE,
    payload: value,
    meta: {pointIndex, reduxPath}
  }
}

export function setOutputValue(pointIndex, value, reduxPath) {
  return {
    type: SET_OUTPUT_VALUE,
    payload: value,
    meta: {pointIndex, reduxPath}
  }
}

export function deletePoint(pointIndex, reduxPath) {
  return {
    type: DELETE_POINT,
    meta: {pointIndex, reduxPath}
  }
}

export function goToEditManually(reduxPath) {
  return {
    type: GO_TO_EDIT_MANUALLY,
    meta: {reduxPath}
  }
}

export function addPoint({x, y}, reduxPath) {
  return {
    type: ADD_POINT,
    payload: {x, y},
    meta: {reduxPath}
  }
}

export function back(reduxPath) {
  return {
    type: BACK,
    meta: {reduxPath}
  }
}

export function next(reduxPath) {
  return {
    type: NEXT,
    meta: {reduxPath}
  }
}
