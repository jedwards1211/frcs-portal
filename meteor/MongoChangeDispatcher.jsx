/* @flow */

import React, {Component, PropTypes} from 'react';
import {shouldComponentUpdate as shouldPureComponentUpdate} from 'react-addons-pure-render-mixin';

import _ from 'lodash';

import Immutable from 'immutable';
import ImmutableObserver from 'meteor-immutable-observer';

import type {Action} from '../flowtypes/reduxTypes';

type Props = {
  collection: Mongo.Collection,
  keyBy?: (document: Immutable.Collection) => string | number | Symbol,
  receiveAction?: (documents: Immutable.Collection) => Action
};

export default class MongoChangeDispatcher extends Component<void,Props,void> {
  static contextTypes = {
    store: PropTypes.shape({
      dispatch: PropTypes.func.isRequired
    }).isRequired
  };
  autorun: ?Tracker.Computaton;
  observer: ?{stop: Function};
  shouldComponentUpdate: (props: Props) => boolean = shouldPureComponentUpdate;
  componentWillMount() {
    this.updateObserver();
  }
  componentWillUpdate() {
    this.updateObserver();
  }
  updateObserver: Function = () => {
    if (this.autorun) this.autorun.stop();
    if (this.observer) this.observer.stop();

    let {collection, keyBy, receiveAction} = this.props;
    let {store: {dispatch}} = this.context;

    let name = collection._name;
    let actionType = 'SET_' + _.snakeCase(name).toUpperCase();

    let observer = this.observer = keyBy ?
      ImmutableObserver.IndexBy(collection.find(), keyBy) :
      ImmutableObserver.Map(collection.find());

    this.autorun = Tracker.autorun(function() {
      let documents = observer.documents();
      Tracker.nonreactive(function() {
        dispatch(receiveAction ? receiveAction(documents) : {
          type: actionType,
          payload: documents
        });
      });
    });
  };
  componentWillUnmount() {
    if (this.autorun) this.autorun.stop();
    if (this.observer) this.observer.stop();
  }
  render(): ReactElement {
    return <span/>;
  }
}
