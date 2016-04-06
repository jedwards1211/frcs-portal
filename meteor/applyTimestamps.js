export default function applyTimestamps(collection) {
  return class TimestampCollection extends collection {
    insert(document, ...args) {
      let date = new Date();
      return super.insert(Object.assign({}, document, {
        insertedTimestamp: date,
        updatedTimestamp: date
      }), ...args);
    }
    update(selector, modifier, ...args) {
      let options = args[0] || {};
      let date = new Date();
      modifier = Object.assign({}, modifier, {
        $set: Object.assign({}, modifier.$set, {
          updatedTimestamp: date
        })
      }, options && options.upsert ? {
        $setOnInsert: Object.assign({}, modifier.$setOnInsert, {
          insertedTimestamp: date 
        })
      } : undefined);
      
      return super.update(selector, modifier, ...args);
    }
    upsert(selector, modifier, ...args) {
      let date = new Date();
      modifier = Object.assign({}, modifier, {
        $set: Object.assign({}, modifier.$set, {
          updatedTimestamp: date
        }),
        $setOnInsert: Object.assign({}, modifier.$setOnInsert, {
          insertedTimestamp: date 
        })
      });
      
      return super.upsert(selector, modifier, ...args);
    }
  };
}
