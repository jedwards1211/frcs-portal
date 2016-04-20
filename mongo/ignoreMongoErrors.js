/* @flow */

export default function ignoreMongoError(errorCodes: number | number[], operation: () => any): any {
  try {
    return operation();
  } 
  catch (e) {
    if (!new RegExp(`\\bE?${errorCodes instanceof Array ? `(${errorCodes.join('|')})` : errorCodes}\\b`)
        .test(e.err || e.errmsg || e.message)) {
      throw e;
    }
  }
}
