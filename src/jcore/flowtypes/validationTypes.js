/* @flow */

export type GroupValidation = Object;

export type FormValidation = {
  valid: boolean,
  [groupKey: string]: GroupValidation,
};
