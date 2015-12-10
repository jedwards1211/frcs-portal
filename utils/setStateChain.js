/**
 * Calls zero or more callbacks in sequence.  If a callback returns an object, the component's
 * state is updated with that object (for the sake of shortening transition sequence code).
 * 
 * @param component - a React component
 * @param {function[]} callbacks - a series of callbacks taking the next callback
 *                                 as argument.  If a callback returns an object,
 *                                 this will call component.setState(<object>, <next callback>).
 */
export default function setStateChain(component, ...callbacks) {
  callbacks.reduceRight(
    (cb, fn) => () => setTimeout(
      () => {
        if (component.isMounted()) {
          let nextState = fn(cb);
          if (typeof nextState === 'object') {
            component.setState(nextState, cb);
          }
        }
      }, 0
    ), 
    () => {}
  )();
}
