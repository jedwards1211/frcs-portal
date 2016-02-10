import {isValidElement} from 'react';

export function errorMessage(err) {
  if (err === null || err === undefined) {
    return 'an unknown error has occurred';
  }
  if (isValidElement(err)) {
    return err;
  }
  if (err instanceof Error) {
    return err.message || err.toString();
  }
  if (err.toString) {
    return err.toString();
  }
  if (!err.length) {
    return 'an unknown error has occurred';
  }
  return JSON.stringify(err);
}
