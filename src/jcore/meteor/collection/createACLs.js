import getUserId from './getUserId'

export default function createACLs(options) {
  let defaultACL = options.defaultACL || []

  return collection => Object.assign(Object.create(collection), {
    insert(document: Object, ...args) {
      let userId = getUserId({args: [document, ...args]})
      return collection.insert(Object.assign({
        creator: userId,
        owner: userId,
        acl: defaultACL
      }, document), ...args)
    },
    update(selector, modifier, options, ...args) {
      if (options && options.upsert) {
        let userId = getUserId({args: [selector, modifier, options, ...args]})
        modifier = Object.assign({}, modifier, {
          $setOnInsert: Object.assign({
            creator: userId,
            owner: userId,
            acl: defaultACL
          }, modifier.$setOnInsert)
        })
      }
      return collection.update(selector, modifier, options, ...args)
    },
    upsert(selector, modifier, options, ...args) {
      let userId = getUserId({args: [selector, modifier, options, ...args]})
      modifier = Object.assign({
        $setOnInsert: Object.assign({
          creator: userId,
          owner: userId,
          acl: defaultACL
        }, modifier.$setOnInsert)
      }, modifier)
      return collection.upsert(selector, modifier, options, ...args)
    }
  })
}
