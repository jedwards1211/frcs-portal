import {numberRegExp, integerRegExp} from '../utils/validationRegExps';
import {PropTypes} from 'react';

export function isValidNumPoints(numPoints, maxNumPoints) {
  let parsed = parseInt(numPoints);
  return integerRegExp.test(numPoints) &&
    parsed >= 2 && parsed <= maxNumPoints;
}

export function isValidInputValue(inputValue) {
  return numberRegExp.test(inputValue);
}

export function isValidOutputValue(outputValue) {
  return numberRegExp.test(outputValue);
}

export const stringOrNumber = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number
]);
