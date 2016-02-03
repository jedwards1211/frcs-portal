import _ from 'lodash';

/**
 * Note: this is intended for testing only.
 * WARNING: this will infinite loop if there are circular references.
 * Finds paths for which the values in the two given objects/immutables.
 * @param a
 * @param b
 * @returns {Array} [{path: [string], a: aValue, b: bValue}] for each path that differs
 */
export default function unequalPaths(a, b) {
  function helper(a, b, result, path) {
    if (a !== b) {
      if (a instanceof Object && b instanceof Object) {
        _.forEach(a, (value, key) => {
          if (!_.has(b, key)) {
            result.push({path: [...path, key], a: value});
          }
          else {
            helper(value, b[key], result, [...path, key]);
          }
        });
        _.forEach(b, (value, key) => {
          if (!_.has(a, key)) {
            result.push({path: [...path, key], b: value});
          }
        });
      }
      else {
        result.push({path, a, b});
      }
    }
  }

  // support immutables
  if (a && a.toJS instanceof Function) a = a.toJS();
  if (b && b.toJS instanceof Function) b = b.toJS();

  let result = [];
  helper(a, b, result, []);
  return result;
}
