import * as Immutable from 'immutable'
import _ from 'lodash'

import {
  SET_NUM_POINTS,
  SET_INPUT_VALUE,
  SET_OUTPUT_VALUE,
  GO_TO_EDIT_MANUALLY,
  DELETE_POINT,
  ADD_POINT,
  BACK,
  NEXT,
  APPLY,
} from './calibrationActions'

import {isValidInputValueOrBlank, isValidOutputValueOrBlank} from './calibrationValidation'

function backReducer(state, action) {
  const {meta: {reduxPaths}} = action

  return state.updateIn(reduxPaths.viewState, viewState => {
    const stepNumber = viewState.get('stepNumber')
    const points = viewState.getIn(['calibration', 'points'])

    if (stepNumber === 'numPoints') {
      return viewState
    }
    else if (stepNumber === 'confirm') {
      if (points.size === 0) {
        return viewState.set('stepNumber', 'numPoints')
      }
      return viewState.set('stepNumber', points.size - 1)
    }
    else if (stepNumber === 0) {
      return viewState.set('stepNumber', 'numPoints').set('numPoints', points.size)
    }
    else {
      let calibration = viewState.get('calibration')
      const inputValue = state.getIn([reduxPaths.calibrationState, 'input', 'value'])
      return viewState.merge({
        stepNumber: stepNumber - 1,
        calibration: calibration.setIn(['points', stepNumber, 'x'], inputValue)
      })
    }
  })
}

function goToEditManuallyReducer(state, action) {
  const {meta: {reduxPaths}} = action

  return state.updateIn(
    reduxPaths.viewState,
    state => state
      .update('calibration', calibration => calibration.withMutations(calibration => {
        calibration.update('points', points => {
          points = points.filter(point => {
            return isValidInputValueOrBlank(point.get('x')) && isValidOutputValueOrBlank(point.get('y'))
          })
          if (points.size < 2) {
            return points.concat(Immutable.Repeat(Immutable.fromJS({
              x: undefined,
              y: undefined,
            }), 2 - points.size))
          }
          return points
        })
        calibration.set('numPoints', calibration.get('points').size)
      }))
      .set('stepNumber', 'confirm')
  )
}

function nextReducer(state, action) {
  const {meta: {reduxPaths}} = action

  let goToConfirm

  state = state.updateIn(reduxPaths.viewState, viewState => {
    let stepNumber = viewState.get('stepNumber')

    if (stepNumber === 'numPoints') {
      return viewState.update('calibration', calibration => calibration.withMutations(calibration => {
        calibration.update('numPoints', parseInt)
        let numPoints = calibration.get('numPoints')
        calibration.update('points', points => points.slice(0, numPoints).concat(
          Immutable.Repeat(Immutable.fromJS({
            x: undefined,
            y: undefined
          }), numPoints - points.size)))
      })).set('stepNumber', 0)
    }

    const inputValue = state.getIn([...reduxPaths.calibrationState, 'input', 'value'])
    viewState = viewState.setIn(['calibration', 'points', stepNumber, 'x'], inputValue)

    if (stepNumber === state.getIn([...reduxPaths.viewState, 'calibration', 'points']).size - 1) goToConfirm = true

    return viewState.set('stepNumber', stepNumber + 1)
  })

  return goToConfirm ? goToEditManuallyReducer(state, action) : state
}

function isValidNumber(num) {
  return _.isNumber(num) && !isNaN(num)
}

function applyReducer(state, action) {
  const {meta: {reduxPaths: {viewState}}} = action
  return state.updateIn([...viewState, 'calibration'], calibration => calibration.update('points', points => {
    return points.map(point => point.update('x', parseFloat).update('y', parseFloat))
      .filter(point => isValidNumber(point.get('x')) && isValidNumber(point.get('y')))
  }))
}

function addPointReducer(state, action) {
  const {meta: {reduxPaths: {viewState}}} = action
  return state.updateIn([...viewState, 'calibration', 'points'], points => points.push(Immutable.fromJS(action.payload)))
}

function deletePointReducer(state, action) {
  const {meta: {reduxPaths: {viewState}}} = action
  return state.updateIn([...viewState, 'calibration', 'points'], points => points.splice(action.meta.pointIndex, 1))
}

export default function calibrationReducer(state, action) {
  const {type, meta, payload} = action
  const reduxPaths = (meta && meta.reduxPaths) || {}
  const {viewState} = reduxPaths

  switch (type) {
    case SET_NUM_POINTS:      return state.setIn([...viewState, 'calibration', 'numPoints'], payload)
    case SET_INPUT_VALUE:     return state.setIn([...viewState, 'calibration', 'points', meta.pointIndex, 'x'], payload)
    case SET_OUTPUT_VALUE:    return state.setIn([...viewState, 'calibration', 'points', meta.pointIndex, 'y'], payload)
    case GO_TO_EDIT_MANUALLY: return goToEditManuallyReducer(state, action)
    case ADD_POINT:           return addPointReducer(state, action)
    case DELETE_POINT:        return deletePointReducer(state, action)
    case BACK:                return backReducer(state, action)
    case NEXT:                return nextReducer(state, action)
    case APPLY:               return applyReducer(state, action)
    default:                  return state
  }
}
