/* @flow */

export default function createChangeSelector<T>(func: (lastArgs: any[], lastResult: T, nextArgs: any[]) => T):
  (...args: any[]) => T
{
  let lastArgs, lastResult
  return (...nextArgs: any[]) => lastResult = func(lastArgs, lastResult, lastArgs = nextArgs)
}
