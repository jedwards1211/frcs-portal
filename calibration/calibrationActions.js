/* @flow */

import type {Action} from '../flowtypes/reduxTypes'

export const ACTION_TYPE_PREFIX = 'CALIBRATION_WIZARD.'
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

type Meta = {
  reduxPaths: {
    viewState: any[],
    calibrationState: any[]
  }
}

export default function calibrationActions(meta: Meta): {
  setNumPoints: (numPoints: string) => Action,
  setInputValue: (pointIndex: number, inputValue: string) => Action,
  setOutputValue: (pointIndex: number, outputValue: string) => Action,
  deletePoint: (pointIndex: number) => Action,
  goToEditManually: () => Action,
  addPoint: (point: {x?: string, y?: string}) => Action,
  back: () => Action,
  next: () => Action,
} {
  return {
    setNumPoints(numPoints) {
      return {
        type: SET_NUM_POINTS,
        payload: numPoints,
        meta
      }
    },
    setInputValue(pointIndex, inputValue) {
      return {
        type: SET_INPUT_VALUE,
        payload: inputValue,
        meta: {...meta, pointIndex}
      }
    },
    setOutputValue(pointIndex, outputValue) {
      return {
        type: SET_OUTPUT_VALUE,
        payload: outputValue,
        meta: {...meta, pointIndex}
      }
    },
    deletePoint(pointIndex) {
      return {
        type: DELETE_POINT,
        meta: {...meta, pointIndex}
      }
    },
    goToEditManually() {
      return {
        type: GO_TO_EDIT_MANUALLY,
        meta
      }
    },
    addPoint({x, y}) {
      return {
        type: ADD_POINT,
        payload: {x, y},
        meta
      }
    },
    back() {
      return {
        type: BACK,
        meta
      }
    },
    next() {
      return {
        type: NEXT,
        meta
      }
    }
  }
}
