import Immutable from 'immutable';
import _ from 'lodash';

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
} from './calibrationActions';

import {isValidInputValue, isValidOutputValue} from './calibrationValidation';

function backReducer(state, action) {
  const stepNumber = state.get('stepNumber');
  const points = state.getIn(['calibration', 'points']);

  if (stepNumber === 'numPoints') {
    return state;
  }
  else if (stepNumber === 'confirm') {
    return state.set('stepNumber', points.size - 1);
  }
  else if (stepNumber === 0) {
    return state.set('stepNumber', 'numPoints').set('numPoints', points.size);
  }
  else {
    let calibration = state.get('calibration');
    const inputValue = state.getIn(['calibrationState', 'input', 'value']);
    return state.merge({
      stepNumber: stepNumber - 1,
      calibration: calibration.setIn(['points', stepNumber, 'x'], inputValue),
    });
  }
}

function goToEditManuallyReducer(state, action) {
  return state.update('calibration', calibration => calibration.withMutations(calibration => {
    calibration.update('points', points => points.filter(point => {
      return isValidInputValue(point.get('x')) && isValidOutputValue(point.get('y')); 
    }));
    calibration.set('numPoints', calibration.get('points').size);
  })).set('stepNumber', 'confirm');
}

function nextReducer(state, action) {
  let stepNumber = state.get('stepNumber');

  if (stepNumber === 'numPoints') {
    return state.update('calibration', calibration => calibration.withMutations(calibration => {
      calibration.update('numPoints', parseInt);
      let numPoints = calibration.get('numPoints');
      calibration.update('points', points => points.slice(0, numPoints).concat(
          Immutable.Repeat(Immutable.fromJS({
            x: undefined, 
            y: undefined
          }), numPoints - points.size)));
    })).set('stepNumber', 0);
  }

  const inputValue = state.getIn(['calibrationState', 'input', 'value']);
  state = state.setIn(['calibration', 'points', stepNumber, 'x'], inputValue);

  if (stepNumber === state.getIn(['calibration', 'points']).size - 1) {
    return goToEditManuallyReducer(state, action);
  }
  return state.set('stepNumber', stepNumber + 1);
}

function isValidNumber(num) {
  return _.isNumber(num) && !isNaN(num);
}

function applyReducer(state, action) {
  return state.update('calibration', calibration => {
    calibration = calibration.update('points', points => {
      return points.map(point => point.update('x', parseFloat).update('y', parseFloat))
        .filter(point => isValidNumber(point.get('x')) && isValidNumber(point.get('y')))
    });
  });
}

function addPointReducer(state, action) {
  return state.updateIn(['calibration', 'points'], points => points.push(Immutable.fromJS(action.payload)));
}

function deletePointReducer(state, action) {
  return state.updateIn(['calibration', 'points'], points => points.splice(action.meta.pointIndex, 1));
}

export default function calibrationReducer(state, action) {
  let {type, meta, payload} = action;

  switch (type) {
    case SET_NUM_POINTS:      return state.setIn(['calibration', 'numPoints'], payload);
    case SET_INPUT_VALUE:     return state.setIn(['calibration', 'points', meta.pointIndex, 'x'], payload);
    case SET_OUTPUT_VALUE:    return state.setIn(['calibration', 'points', meta.pointIndex, 'y'], payload);
    case GO_TO_EDIT_MANUALLY: return goToEditManuallyReducer(state, action);
    case ADD_POINT:           return addPointReducer(state, action);
    case DELETE_POINT:        return deletePointReducer(state, action);
    case BACK:                return backReducer(state, action);
    case NEXT:                return nextReducer(state, action);
    case APPLY:               return applyReducer(state, action);
    default:                  return state;
  }
}
