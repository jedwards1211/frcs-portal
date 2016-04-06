/* eslint-disable no-inner-declarations */
/* eslint-disable no-console */

// Copped from Meteor source, it's not part of exported api.
// Returns true if this is an object with at least one key and all keys begin
// with $.  Unless inconsistentOK is set, throws if some keys begin with $ and
// others don't.
export default function applyCheckSchema(schema) {
  if (Meteor.isServer) {
    const createCheckSchemaMethods = require('./createCheckSchemaMethods').default;
    
    return function(collectionClass) {
      if (collectionClass instanceof Mongo.Collection) {
        let {insert, update, upsert} = collectionClass;
        Object.assign(collectionClass, createCheckSchemaMethods({insert, update, upsert}, schema));
      }
      else {
        class CheckSchemaCollection extends collectionClass { }
        Object.assign(CheckSchemaCollection.prototype, createCheckSchemaMethods(collectionClass.prototype, schema));
        return CheckSchemaCollection;
      }
    }
  }
  else {
    return collectionClass => collectionClass;
  }
}
