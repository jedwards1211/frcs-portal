/* @flow */

import type {SortSpecifier} from '../flowtypes/meteorTypes';
import type {SortSpecifier as MongoSortSpecifier} from '../flowtypes/mongoTypes';

// converts a Meteor-style sort specifier to a pure Mongo sort specifier
export default function toMongoSort(sort: SortSpecifier): MongoSortSpecifier {
  function dirToNumber(direction: number | 'asc' | 'desc'): number {
    switch (direction) {
      case 'asc': return 1;
      case 'desc': return -1;
      default: return typeof direction === 'number' ? direction : 1;
    }
  }

  if (sort instanceof Array) {
    let result = {};
    sort.forEach(field => {
      if (field instanceof Array) {
        result[field[0]] = dirToNumber(field[1]);
      }
      else {
        result[field] = 1;
      }
    });
    return result;
  }

  // if not an array, it's already compatible
  let result: any = sort;
  return result;
}
