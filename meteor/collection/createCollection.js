/* @flow */

import type {Transform} from '../../flowtypes/meteorTypes'

const collections: Map<string, Mongo.Collection> = new Map()

/**
 * Prevents "there is already a collection named ..." errors when hot reloading
 */
export default function createCollection(
  name: string,
  options?: {connection?: Object, transform?: Transform}
): Mongo.Collection
{
  let collection = collections.get(name)
  if (!collection) {
    collection = new Mongo.Collection(name, options)
    collections.set(name, collection)
  }
  return collection
}
