/* @flow */

import type {Selector, PublishHandler} from '../flowtypes/meteorTypes';
import type {AggregationPipeline} from '../flowtypes/mongoTypes';
import _ from 'lodash';

type Options = {
  observeSelector?: Selector,
  clientCollection?: string,
  throttleWait?: number
};

export default function reactiveAggregate(sub: PublishHandler, countName: string, collection: Mongo.Collection,
                                          pipeline: AggregationPipeline, options?: Options = {}): void {
  let observeSelector = options.observeSelector || {};
  let clientCollection = options.clientCollection || collection._name;
  let throttleWait = options.throttleWait || 1000;

  let initializing = true;
  let countAdded = false;

  const update = _.throttle(Meteor.bindEnvironment(() => {
    if (initializing) return;

    let result = collection.aggregate([...pipeline, {$group: {
      _id: null,
      count: {$sum: 1}
    }}]);
    
    let count = result.length ? result[0].count : 0;
    
    if (countAdded) {
      sub.changed(clientCollection, countName, {count});
    }
    else {
      sub.added(clientCollection, countName, {count});
      countAdded = true;
    }
  }), throttleWait);

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
