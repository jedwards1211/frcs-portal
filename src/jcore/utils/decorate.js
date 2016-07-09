/* @flow */

export default function decorate<X>(first: (target: any) => X, ...decorators: Array<(target: any) => any>): (target: any) => X {
  return target => [first, ...decorators].reduceRight(
    (target, decorator) => decorator(target),
    target
  )
}
