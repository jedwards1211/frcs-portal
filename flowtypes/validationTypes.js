/* @flow */

export type GroupValidation = {
  error?: any,
  alarm?: any,
  danger?: any,
  warning?: any,
  success?: any,
  ok?: any,
  info?: any,
};

export type FormValidation = {
  valid: boolean,
  [groupKey: string]: GroupValidation,
};
