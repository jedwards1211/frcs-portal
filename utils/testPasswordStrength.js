/* @flow */

import React from 'react';
import owasp from 'owasp-password-strength-test';

owasp.config({
  allowPassphrases       : true,
  maxLength              : 40,
  minLength              : 10,
  minPhraseLength        : 20,
  minOptionalTestsToPass : 4
});

export function testPasswordStrength(password: string): Object {
  return owasp.test(password);
}

export function testPasswordStrengthForUI(password: string): Object {
  let strength = testPasswordStrength(password);
  if (strength.requiredTestErrors.length) {
    return {error: <ul className="password-strength-errors">
      {strength.requiredTestErrors.map((error, index) => <li key={index}>{error}</li>)}
    </ul>};
  }
  else if (strength.strong) {
    return {success: <span>Strength: <strong>strong</strong></span>};
  }
  else {
    return {warning: <span>Strength: <strong>weak</strong></span>};
  }
}
