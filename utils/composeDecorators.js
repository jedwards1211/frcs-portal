/* @flow */

export default function composeDecorators<X>(...decorators: Array<(target: X) => X>): (target: X) => X {
  return target => decorators.reduceRight(
    (target, decorator) => decorator(target),
    target 
  );
}
