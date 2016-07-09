/* @flow */

import type {PublishHandler} from '../flowtypes/meteorTypes'

export default function crossPublish(sub: PublishHandler, cursor: Mongo.Cursor, collectionName: string): void {
  const handle = cursor.observeChanges({
    added: (id: string, fields: Object) => sub.added(collectionName, id, fields),
    changed: (id: string, fields: Object) => sub.changed(collectionName, id, fields),
    removed: (id: string) => sub.removed(collectionName, id),
    error: (error: Error) => sub.error(error)
  })

  sub.ready()

  sub.onStop(() => handle.stop())
}
