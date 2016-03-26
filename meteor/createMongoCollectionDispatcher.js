/* @flow */

import _ from 'lodash';

import Immutable from 'immutable';
import ImmutableObserver from 'meteor-immutable-observer';

import type {Dispatch, Action} from '../flowtypes/reduxTypes';

export default function createMongoCollectionDispatcher(collection: Mongo.Collection, dispatch: Dispatch, options?: {
  keyBy?: (document: Immutable.Collection) => string | number | Symbol,
  receiveAction?: (documents: Immutable.Collection) => Action
}): {stop: Function} {
  let {keyBy, receiveAction} = options || {};
  let name = collection._name;
  let actionType = 'SET_' + _.snakeCase(name).toUpperCase();
  
  let observer = keyBy ?
    ImmutableObserver.IndexBy(collection.find(), keyBy) :
    ImmutableObserver.Map(collection.find());

  let docsAutorun = Tracker.autorun(function() {
    let documents = observer.documents();
    Tracker.nonreactive(function() {
      dispatch(receiveAction? receiveAction(documents) : {
        type: actionType,
        payload: documents
      });
    });
  });
  
  return {
    stop() {
      docsAutorun.stop();
      observer.stop(); 
    }
  };
}
