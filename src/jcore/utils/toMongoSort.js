/* @flow */

import type {SortSpecifier as MongoSortSpecifier} from '../flowtypes/mongoTypes'

// converts a Meteor-style sort specifier to a pure Mongo sort specifier
export default function toMongoSort(sort: mixed): ?MongoSortSpecifier {
  function dirToNumber(direction: number | 'asc' | 'desc'): number {
    switch (direction) {
    case 'asc': return 1
    case 'desc': return -1
    default: return typeof direction === 'number' ? direction : 1
    }
  }

  let result = {}
  if (sort instanceof Array) {
    sort.forEach(field => {
      if (field instanceof Array) {
        result[field[0]] = dirToNumber(field[1])
      }
      else {
        result[field] = 1
      }
    })
  } else if (sort instanceof Object) {
    result = sort
  }

  return Object.keys(result).length ? result : undefined
}
