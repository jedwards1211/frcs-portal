import Immutable from 'immutable';
import _ from 'lodash';

import {
  SET_NUM_POINTS,
  SET_OUTPUT_VALUE,
  BACK,
  NEXT,
  APPLY,
} from './calibrationActions';

function backReducer(state, action) {
  let skipNumPoints = state.get('skipNumPoints');
  let stepNumber = state.get('stepNumber');
  let numPoints = state.getIn(['calibration', 'numPoints']);

  const firstStep = skipNumPoints ? 1 : 0;

  if (stepNumber === firstStep) {
    return state;
  }
  else if (stepNumber === numPoints + 1) {
    return state.set('stepNumber', stepNumber - 1);
  }
  else {
    let calibration = state.get('calibration');
    const inputValue = state.getIn(['calibrationState', 'input', 'value']);
    return state.merge({
      stepNumber: stepNumber - 1,
      calibration: calibration.setIn(['points', stepNumber - 1, 'x'], inputValue),
    });
  }
}

function nextReducer(state, action) {
  let stepNumber = state.get('stepNumber');

  if (stepNumber === 0) {
    state = state.update('calibration', calibration => calibration.withMutations(calibration => {
      calibration.update('numPoints', parseInt);
      let numPoints = calibration.get('numPoints');
      calibration.update('points', points => points.concat(
          Immutable.Repeat(Immutable.fromJS({
            x: undefined, 
            y: undefined
          }), numPoints - points.size).toList().slice(0, numPoints)));
    }));
  }
  else {
    const inputValue = state.getIn(['calibrationState', 'input', 'value']);
    state = state.setIn(['calibration', 'points', stepNumber - 1, 'x'], inputValue);
  }
  return state.set('stepNumber', stepNumber + 1);
}

function isValidNumber(num) {
  return _.isNumber(num) && !isNaN(num);
}

function applyReducer(state, action) {
  return state.updateIn(['calibration', 'points'], points => {
    return points.map(point => point.update('x', parseFloat).update('y', parseFloat))
      .filter(point => isValidNumber(point.get('x')) && isValidNumber(point.get('y')));
  });
}

export default function calibrationReducer(state, action) {
  let {type, meta, payload} = action;

  switch (type) {
    case SET_NUM_POINTS:   return state.setIn(['calibration', 'numPoints'], payload);
    case SET_OUTPUT_VALUE: return state.setIn(['calibration', 'points', meta.pointIndex, 'y'], payload);
    case BACK:                return backReducer(state, action);
    case NEXT:                return nextReducer(state, action);
    case APPLY:               return applyReducer(state, action);
    default:                  return state;
  }
}
