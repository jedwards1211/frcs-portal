/* @flow */

import _ from 'lodash';

export default function remove$ext(collection: Mongo.Collection): Mongo.Collection {
  return Object.assign(Object.create(collection), {
    find(selector: Object, ...args): Mongo.Cursor {
      return collection.find(_.omit(selector, '$ext'), ...args);
    },
    findOne(selector: Object, ...args): Object{
      return collection.findOne(_.omit(selector, '$ext'), ...args);
    },
    insert(document: Object, ...args): any {
      return collection.insert(_.omit(document, '$ext'), ...args);
    },
    update(selector: Object, ...args): number {
      return collection.update(_.omit(selector, '$ext'), ...args);
    },
    upsert(selector: Object, ...args): {numberAffected: ?number, insertedId: any} {
      return collection.upsert(_.omit(selector, '$ext'), ...args);
    },
    remove(selector: Object, ...args): number {
      return collection.remove(_.omit(selector, '$ext'), ...args);
    }
  });
}
