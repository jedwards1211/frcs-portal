export default function applyTimestamps(collection) {
  return Object.assign(Object.create(collection), {
    insert(document, ...args) {
      let date = new Date()
      return collection.insert(Object.assign({}, document, {
        insertedTimestamp: date,
        updatedTimestamp: date
      }), ...args)
    },
    update(selector, modifier, ...args) {
      let options = args[0] || {}
      let date = new Date()
      modifier = Object.assign({}, modifier, {
        $set: Object.assign({}, modifier.$set, {
          updatedTimestamp: date
        })
      }, options && options.upsert ? {
        $setOnInsert: Object.assign({}, modifier.$setOnInsert, {
          insertedTimestamp: date
        })
      } : undefined)

      return collection.update(selector, modifier, ...args)
    },
    upsert(selector, modifier, ...args) {
      let date = new Date()
      modifier = Object.assign({}, modifier, {
        $set: Object.assign({}, modifier.$set, {
          updatedTimestamp: date
        }),
        $setOnInsert: Object.assign({}, modifier.$setOnInsert, {
          insertedTimestamp: date
        })
      })

      return collection.upsert(selector, modifier, ...args)
    }
  })
}
