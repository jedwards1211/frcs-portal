import {numberRegExp, integerRegExp} from '../utils/validationRegExps';
import {PropTypes} from 'react';
import _ from 'lodash';

export function isValidNumPoints(numPoints, maxNumPoints) {
  let parsed = parseInt(numPoints);
  return integerRegExp.test(numPoints) &&
    parsed >= 2 && parsed <= maxNumPoints;
}

export function isValidInputValue(inputValue) {
  return (_.isNumber(inputValue) && !isNaN(inputValue)) || numberRegExp.test(inputValue);
}

export function isValidInputValueOrBlank(inputValue) {
  return inputValue === '' || inputValue === undefined || inputValue === null ||
    isValidInputValue(inputValue);
}

export function isValidOutputValue(outputValue) {
  return (_.isNumber(outputValue) && !isNaN(outputValue)) || numberRegExp.test(outputValue);
}

export function isValidOutputValueOrBlank(outputValue) {
  return outputValue === '' || outputValue === undefined || outputValue === null ||
    isValidOutputValue(outputValue);
}

export const stringOrNumber = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number
]);
