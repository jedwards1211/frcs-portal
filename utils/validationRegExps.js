export const numberRegExp = /^\s*[-+]?(\d+(\.\d*)?|\.\d+)\s*$/;
export const numberOrBlankRegExp = /^\s*([-+]?(\d+(\.\d*)?|\.\d+))?\s*$/;

export const unsignedNumberRegExp = /^\s*(\d+(\.\d*)?|\.\d+)\s*$/;
export const unsignedNumberOrBlankRegExp = /^\s*(\d+(\.\d*)?|\.\d+)?\s*$/;

export const integerRegExp = /^\s*[-+]?\d+\s*$/;
export const integerOrBlankRegExp = /^\s*([-+]?\d+)?\s*$/;

export const unsignedIntegerRegExp = /^\s*\d+\s*$/;
export const unsignedIntegerOrBlankRegExp = /^\s*\d*\s*$/;

export function isEmptyValue(value) {
  return value === '' || value === undefined || value === null;
}

/**
 * @param {number|string} value the number or string to parse.
 * @param {regExp} the regular expression specifying allowed string values.
 * @returns value if it is a number, the number parsed from it if it was
 * a string matching regExp, or undefined.
 */
export function parseNumber(value, regExp) {
  if (typeof value === 'string' && regExp.test(value)) {
    return parseFloat(value);
  }
  else if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
}
