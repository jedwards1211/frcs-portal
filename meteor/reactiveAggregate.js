/* @flow */

import type {Selector, PublishHandler} from '../flowtypes/meteorTypes';
import type {AggregationPipeline} from '../flowtypes/mongoTypes';
import _ from 'lodash';

type Options = {
  observeSelector?: Selector,
  clientCollection?: string,
  throttleWait?: number
};

export default function reactiveAggregate(sub: PublishHandler, collection: Mongo.Collection,
                                          pipeline: AggregationPipeline, options?: Options = {}): void {
  let observeSelector = options.observeSelector || {};
  let clientCollection = options.clientCollection || collection._name;
  let throttleWait = options.throttleWait || 1000;

  let initializing = true;
  sub._ids = {};
  sub._iteration = 1;

  const doUpdate = _.throttle(Meteor.bindEnvironment(() => {
    try {
      let cursor = collection.aggregate(pipeline);
      cursor.forEach(doc => {
        if (!sub._ids[doc._id]) {
          sub.added(clientCollection, doc._id, doc);
        } else {
          sub.changed(clientCollection, doc._id, doc);
        }
        sub._ids[doc._id] = sub._iteration;
      });
      // remove documents not in the result anymore
      for (let k in sub._ids) {
        let v = sub._ids[k];
        if (v !== sub._iteration) {
          delete sub._ids[k];
          sub.removed(clientCollection, k);
        }
      }
      sub._iteration++;
    }
    catch (e) {
      sub.stop(e);
    }
  }), throttleWait);

  const update = () => {
    if (!initializing) doUpdate();
  };

  // track any changes on the collection used for the aggregation
  let query = collection.find(observeSelector);
  let handle = query.observeChanges({
    added: update,
    changed: update,
    removed: update,
    error: function (err) {
      throw err;
    }
  });
  // observeChanges() will immediately fire an "added" event for each document in the query
  // these are skipped using the initializing flag
  initializing = false;
  // send an initial result set to the client
  update();
  // mark the subscription as ready
  sub.ready();

  // stop observing the cursor when the client unsubscribes
  sub.onStop(() => {
    handle.stop();
  });
}
