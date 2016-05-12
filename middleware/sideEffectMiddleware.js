/* eslint-disable no-console */

import Promise from 'bluebird';

/**
 * Enables reducers to perform side effects by adding a `sideEffect`
 * function to the `action`.  In your reducer you just call
 * `action.sideEffect(({dispatch, getState}) => {...});`
 */
export default store => next => action => {
  let sideEffects = [];
  if (action.sideEffect) {
    // don't re-perform side effects of recorded and replayed actions
    return next(action);
  }

  action.sideEffect = callback => sideEffects.push(callback);
  let result = next(action);
  sideEffects = sideEffects.map(sideEffect => {
    let result;
    try {
      result = sideEffect(store);
    }
    catch (err) {
      console.error(err.stack);
      return undefined;
    }

    if (result instanceof Promise) {
      result.catch(err => {
        console.error(err.stack);
        throw err;
      });
    }
    return result;
  });
  return sideEffects.length ? sideEffects[sideEffects.length - 1] : result;
};