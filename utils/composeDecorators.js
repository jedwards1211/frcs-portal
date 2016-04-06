/* @flow */

export default function composeDecorators(...decorators: Array<(target: mixed) => mixed>): (target: mixed) => mixed {
  return (target: mixed) => decorators.reduceRight(
    (target, decorator) => decorator(target),
    target 
  );
}
