import _ from 'lodash'

/**
 * Creates a function that returns the same object as it last returned if its last return value and
 * next return value are equal according to equalityCheck.  (memoize typically means to check if the
 * arguments are equal, rather than the return value).
 * @param{function} func - the function to memoize.
 * @param{function} equalityCheck - returns true iff the outputs of two invocations of func are equal.
 * @return{function} the memoized version of func.
 */
export default function memoizeByOutput(func, equalityCheck = _.isEqual) {
  let lastOutput
  return function (...args) {
    let output = func(...args)
    if (!equalityCheck(lastOutput, output)) {
      lastOutput = output
    }
    return lastOutput
  }
}
