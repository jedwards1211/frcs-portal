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
