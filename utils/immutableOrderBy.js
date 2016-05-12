/* @flow */

import * as Immutable from 'immutable'

export default function orderBy(collection: Immutable.Iterable,
                                iteratees: Array<any>,
                                orders: Array<'asc' | 'desc'>): Immutable.Iterable {
  return collection.sortBy(
    (value, ...args) => iteratees.map(
      iteratee => iteratee instanceof Function ? iteratee(value, ...args) : value.get(iteratee)),
    (a, b) => {
      for (let i = 0; i < iteratees.length; i++) {
        let aValue = a[i]
        let bValue = b[i]
        let order = orders[i]

        if (aValue > bValue) {
          return order === 'asc' ? 1 : -1
        }
        if (aValue < bValue) {
          return order === 'asc' ? -1 : 1
        }
      }
      return 0
    }
  )
}
