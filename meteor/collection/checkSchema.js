/* eslint-disable no-inner-declarations */
/* eslint-disable no-console */

// Copped from Meteor source, it's not part of exported api.
// Returns true if this is an object with at least one key and all keys begin
// with $.  Unless inconsistentOK is set, throws if some keys begin with $ and
// others don't.
export default function checkSchema(schema, options = {}) {
  let {monkeypatch} = options;
  
  if (Meteor.isServer) {
    const createCheckSchemaMethods = require('./createCheckSchemaMethods').default;
    
    return function(collection) {
      if (monkeypatch) {
        Object.assign(collection, createCheckSchemaMethods({
          insert: () => collection.insert(...arguments), 
          update: () => collection.update(...arguments), 
          upsert: () => collection.upsert(...arguments)
        }, schema));
      }
      else {
        return Object.assign(Object.create(collection), createCheckSchemaMethods(collection, schema));
      }
    }
  }
  else {
    return collection => collection;
  }
}
