/* @flow */

export type ErrorMessage = string | Error | {toString: () => string} /* | ReactElement<any, any, any>*/;
