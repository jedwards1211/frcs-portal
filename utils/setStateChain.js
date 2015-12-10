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
