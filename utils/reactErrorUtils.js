import {isValidElement} from 'react';
import {errorMessage as superErrorMessage} from './errorUtils';

export function errorMessage(err) {
  if (isValidElement(err)) {
    return err;
  }
  return superErrorMessage(err);
}
