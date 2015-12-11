/* eslint-disable no-console */

/**
 * Calls zero or more callbacks in sequence.  If a callback returns an object, the component's
 * state is updated with that object (for the sake of shortening transition sequence code).
 * 
 * @param component - a React component
 * @param {function[]} callbacks - a series of callbacks taking the next callback
 *                                 as argument.  If a callback returns an object,
 *                                 this will call component.setState(<object>, <next callback>).
 */
export default function setStateChain(component, callbacks, finalCallback = function() {}) {
  let canceled = false;
  
  callbacks.reduceRight(
    (cb, fn, index) => () => {
      function perform() {
        try {
          let nextState = fn(cb);
          if (typeof nextState === 'object') {
            component.setState(nextState, cb);
          }
        } catch (err) {
          console.error(err.stack);
          cb(err);
        }
      }

      if (index === 0) {
        perform();
      } 
      else {
        setTimeout((err) => {
          if (canceled) return;
          if (err) return cb(err);
          if (component.isMounted()) perform();
        }, 0);
      }
    }, finalCallback)();

  return {
    cancel() {
      canceled = true;
    }
  };
}
