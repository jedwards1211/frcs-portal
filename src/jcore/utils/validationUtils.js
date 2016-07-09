import _ from 'lodash'

export const numberRegExp = /^\s*[-+]?(\d+(\.\d*)?|\.\d+)\s*$/
export const numberOrBlankRegExp = /^\s*([-+]?(\d+(\.\d*)?|\.\d+))?\s*$/

export const unsignedNumberRegExp = /^\s*(\d+(\.\d*)?|\.\d+)\s*$/
export const unsignedNumberOrBlankRegExp = /^\s*(\d+(\.\d*)?|\.\d+)?\s*$/

export const integerRegExp = /^\s*[-+]?\d+\s*$/
export const integerOrBlankRegExp = /^\s*([-+]?\d+)?\s*$/

export const unsignedIntegerRegExp = /^\s*\d+\s*$/
export const unsignedIntegerOrBlankRegExp = /^\s*\d*\s*$/

export function isEmptyValue(value) {
  return value === '' || value === undefined || value === null
}

/**
 * @param {number|string} value the number or string to parse.
 * @param {regExp} the regular expression specifying allowed string values.
 * @returns value if it is a number, the number parsed from it if it was
 * a string matching regExp, or undefined.
 */
export function parseNumber(value, regExp) {
  if (typeof value === 'string' && regExp.test(value)) {
    return parseFloat(value)
  }
  else if (typeof value === 'number' && !isNaN(value)) {
    return value
  }
}

export function validateInteger(number, options = {}) {
  let {required, range, min, max} = options
  if (typeof number === 'string') {
    if (!required) {
      if (number === '' || number === undefined || number === null) {
        return
      }
    }
    if (!integerRegExp.test(number)) {
      return {error: 'Please enter a valid number'}
    }
  }
  number = parseInt(number)
  if (isNaN(number)) {
    return {error: 'Please enter a valid number'}
  }
  min = range ? range.min : min
  max = range ? range.max : max

  if (min != null && max != null && (number < min || number > max)) {
    return {error: `Please enter a number between ${min} and ${max}`}
  }
  if (number < min) {
    return {error: `Please enter a number >= ${min}`}
  }
  if (number > max) {
    return {error: `Please enter a number <= ${max}`}
  }
  return {}
}

export function validateNumber(number, options = {}) {
  let {required, range, min, max} = options
  if (typeof number === 'string') {
    if (!required) {
      if (number === '' || number === undefined || number === null) {
        return
      }
    }
    if (!numberRegExp.test(number)) {
      return {error: 'Please enter a valid number'}
    }
  }
  number = parseFloat(number)
  if (isNaN(number)) {
    return {error: 'Please enter a valid number'}
  }
  min = range ? range.min : min
  max = range ? range.max : max

  if (min != null && max != null && (number < min || number > max)) {
    return {error: `Please enter a number between ${min} and ${max}`}
  }
  if (number < min) {
    return {error: `Please enter a number >= ${min}`}
  }
  if (number > max) {
    return {error: `Please enter a number <= ${max}`}
  }
  return {}
}

export function assignValidity(validation) {
  if (validation && Object.getPrototypeOf(validation) === Object.prototype && Object.isExtensible(validation)) {
    _.forEach(validation, elem => assignValidity(elem))
    if (validation.valid !== false) {
      validation.valid = !_.some(validation, (v, key) => v && (key === 'error' || v.valid === false))
    }
  }
  return validation
}
