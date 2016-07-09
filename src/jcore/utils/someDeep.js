/* @flow */

import _ from 'lodash'

export default function someDeep(collection: Array<any> | Object,
  predicate?: (value: any, key: number | string, collection: Array<any> | Object) => any = _.identity): boolean {
  return _.some(collection, (value, key, collection) => predicate(value, key, collection) ||
    (value instanceof Object && someDeep(value, predicate)))
}
