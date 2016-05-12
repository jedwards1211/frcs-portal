/* @flow */

export default function ignoreMongoError(errorCodes: number | number[], operation: () => any): any {
  try {
    return operation()
  }
  catch (e) {
    if (errorCodes instanceof Array ? errorCodes.indexOf(e.code) < 0 : errorCodes !== e.code) {
      throw e
    }
  }
}
