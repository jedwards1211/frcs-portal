/* @flow */

import type {Selector, PublishHandler} from '../../flowtypes/meteorTypes'
import _ from 'lodash'

let Counts: Mongo.Collection

if (Meteor.isClient) {
  Counts = new Mongo.Collection('counts')
}

export default Counts

let publishCount: (sub: PublishHandler, options: {
  countName?: string,
  collection?: Mongo.Collection,
  selector?: Selector,
  cursor?: Mongo.Cursor
}) => void = function () {}

if (Meteor.isServer) {
  publishCount = function publishCount(sub: PublishHandler, options: {
    countName?: string,
    collection?: Mongo.Collection,
    selector?: Selector,
    cursor?: Mongo.Cursor
  }) {
    const {collection, selector} = options
    const countName = options.countName || (collection && collection._name) || ""
    const cursor = options.cursor || (collection && collection.find(selector))

    if (cursor == null) {
      sub.error(new Meteor.Error("you must provide collection/selector/[countName] or cursor/countName"))
      return null
    }

    let initializing = true
    const update = _.throttle(Meteor.bindEnvironment(() => {
      if (initializing) return
      sub.changed('counts', countName, {count: cursor.count()})
    }), 1000)

    let observer = cursor.observeChanges({
      added: update,
      removed: update
    })

    initializing = false
    sub.added('counts', countName, {count: cursor.count()})
    sub.ready()

    sub.onStop(() => observer.stop())
  }
}

export {publishCount}
