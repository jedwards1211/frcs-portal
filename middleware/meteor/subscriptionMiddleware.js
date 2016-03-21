import Immutable from 'immutable';

import ImmutableObserver from 'meteor-immutable-observer';

import {INITIALIZE, STOP} from '../../actions/rootActions';
import {setMeteorState} from '../../actions/meteorActions';

import {createMiddleware} from 'mindfront-redux-utils';

export default function subscriptionMiddleware({
  recordSetName,
  collection,
  receiveAction,
  keyBy,
  }) {
  return createMiddleware({
    [INITIALIZE]: store => next => action => {
      let observer = keyBy ?
        ImmutableObserver.IndexBy(collection.find(), keyBy) :
        ImmutableObserver.Map(collection.find());

      let docsAutorun = Tracker.autorun(function() {
        let documents = observer.documents();
        Tracker.nonreactive(function() {
          store.dispatch(receiveAction(documents));
        });
      });

      let subscription = Meteor.subscribe(recordSetName, {
        onReady() {
          let newMeteorState = store.getState().getIn(['meteorState', recordSetName]).set('ready', true);
          store.dispatch(setMeteorState({[recordSetName]: newMeteorState}));
        },
        onStop(err) {
          if (err) {
            let newMeteorState = store.getState().getIn(['meteorState', recordSetName]).set('error', err);
            store.dispatch(setMeteorState({[recordSetName]: newMeteorState}));
          }
        }
      });

      let meteorState = Immutable.Map({
        subscription,
        observer,
        docsAutorun
      });
      store.dispatch(setMeteorState({[recordSetName]: meteorState}));

      return next(action);
    },
    [STOP]: store => next => action => {
      let meteorState = store.getState().getIn(['meteorState', recordSetName]);

      if (meteorState) {
        let subscription = meteorState.get('subscription');
        let observer = meteorState.get('observer');
        let docsAutorun = meteorState.get('docsAutorun');

        if (subscription) subscription.stop();
        if (observer) observer.stop();
        if (docsAutorun) docsAutorun.stop();

        store.dispatch(setMeteorState({[recordSetName]: undefined}));
      }
      return next(action);
    }
  });
}