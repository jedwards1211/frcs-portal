/* @flow */

import _ from 'lodash'
import shallowEqual from 'fbjs/lib/shallowEqual'

const methods = {
  find: true,
  findOne: true,
  insert: true,
  update: true,
  upsert: true,
  remove: true
}

export const headers = Symbol('headers')

export default function headerSupport<X: Mongo.Collection>(collection: X): X & {withHeaders: (theHeaders: Object) => X} {
  let lastHeaders
  let lastHeaderCollection: ?X

  // flow-issue(mindfront-react-components)
  return Object.assign(Object.create(collection), {
    withHeaders(theHeaders: Object): X {
      if (shallowEqual(theHeaders, lastHeaders) && lastHeaderCollection) {
        return lastHeaderCollection
      }

      lastHeaders = theHeaders
      return lastHeaderCollection = Object.assign(Object.create(collection),
        _.mapValues(methods, (t, method) => (...args) => {
          if (args[0] instanceof Object) {
            return (collection: Object)[method]({...args[0], [headers]: theHeaders}, ...args.slice(1))
          }
          throw new Error("first argument must be an Object when using withHeaders")
        }))
    }
  })
}
