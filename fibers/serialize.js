/* @flow */

/**
 * Wraps a synchronous function in one to which calls will run in sequence, even if called within fibers.
 */
export default function serialize(func: Function): Function {
  const queue: Array<{args: any[], cb: Function}> = []

  const process = Meteor.bindEnvironment(() => {
    const {args, cb} = queue.shift()
    try {
      cb(undefined, func(args))
    } catch (error) {
      cb(error)
    } finally {
      if (queue.length) setTimeout(process, 0)
    }
  })

  return Meteor.wrapAsync((args: any[], cb: Function) => {
    if (!queue.length) setTimeout(process, 0)
    queue.push({args, cb})
  })
}
