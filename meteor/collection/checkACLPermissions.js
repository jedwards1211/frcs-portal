import _ from 'lodash';

import getUserId from './getUserId';

import type {Selector, QueryOptions} from '../../flowtypes/meteorTypes';
import type {Modifier} from '../../flowtypes/mongoTypes';

import createACLPermissionsChecker from '../../mongo/createACLPermissionsChecker';

export default function checkACLPermissions(collection: Mongo.Collection): Mongo.Collection {
  return Object.assign(Object.create(collection), {
    find(selector?: Selector = {}, options?: QueryOptions): Mongo.Cursor {
      if (Meteor.isServer) {
        let userId = getUserId({selector, options});

        let checkDocument = createACLPermissionsChecker({
          user: userId,
          permissions: "read"
        });

        collection.find(selector, options && {
          ...options,
          fields: options.fields && _.omit(options.fields, 'acl')
        }).forEach(checkDocument);
      }
      return collection.find(selector, options);
    },
    findOne(selector?: Selector = {}, options?: QueryOptions): ?Object {
      if (Meteor.isServer) {
        let userId = getUserId({selector, options});

        let checkDocument = createACLPermissionsChecker({
          user: userId,
          permissions: "read"
        });

        let document = collection.findOne(selector, options && {
          ...options,
          fields: options.fields && _.omit(options.fields, 'acl')
        });
        if (document) checkDocument(document);
      }
      return collection.findOne(selector, options);
    },
    update(selector: Selector, modifier: Modifier, ...args): number {
      if (Meteor.isServer) {
        let options = args[0];
        let userId = getUserId({selector, options});

        let checkDocument = createACLPermissionsChecker({
          user: userId,
          permissions: "write"
        });

        collection.find(selector, options && {
          ...options,
          fields: options.fields && _.omit(options.fields, 'acl')
        }).forEach(checkDocument);
      }
      return collection.update(selector, modifier, ...args);
    },
    upsert(selector: Selector, modifier: Modifier, ...args): {numberAffected: ?number, insertedId: ?string} {
      if (Meteor.isServer) {
        let options = args[0];
        let userId = getUserId({selector, options});

        let checkDocument = createACLPermissionsChecker({
          user: userId,
          permissions: "write"
        });

        collection.find(selector, options && {
          ...options,
          fields: options.fields && _.omit(options.fields, 'acl')
        }).forEach(checkDocument);
      }
      return collection.upsert(selector, modifier, ...args);
    },
    remove(selector?: Selector = {}, ...args): number {
      if (Meteor.isServer) {
        let userId = getUserId({selector});

        let checkDocument = createACLPermissionsChecker({
          user: userId,
          permissions: "remove"
        });
        
        collection.find(selector).forEach(checkDocument);
      }
      return collection.remove(selector, ...args);
    }
  });
}
