export const SET_NUM_POINTS = 'SET_NUM_POINTS';
export const SET_INPUT_VALUE = 'SET_INPUT_VALUE';
export const SET_OUTPUT_VALUE = 'SET_OUTPUT_VALUE';
export const DELETE_POINT = 'DELETE_POINT';
export const ADD_POINT = 'ADD_POINT';
export const BACK = 'BACK';
export const NEXT = 'NEXT';
export const APPLY = 'APPLY';
export const CANCEL = 'CANCEL';

export function setInputValue(pointIndex, value) {
  return {
    type: SET_INPUT_VALUE,
    payload: value,
    meta: {pointIndex},
  };
}

export function setOutputValue(pointIndex, value) {
  return {
    type: SET_OUTPUT_VALUE,
    payload: value,
    meta: {pointIndex},
  };
}

export function deletePoint(pointIndex) {
  return {
    type: DELETE_POINT,
    meta: {pointIndex},
  };
}

export function addPoint({x, y}) {
  return {
    type: ADD_POINT,
    payload: {x, y},
  };
}
