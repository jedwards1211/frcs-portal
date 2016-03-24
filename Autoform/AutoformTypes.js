/* @flow */

export type AutoformFieldChangeCallback =
  (autoformField: string, newValue: any, options?: {autoformPath?: Array<string | number>}) => any;
