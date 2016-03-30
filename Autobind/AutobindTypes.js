/* @flow */

export type OnAutobindFieldChange =
  (autobindField: string | number, newValue: any, options?: {autobindPath?: Array<string | number>}) => any;
