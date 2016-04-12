/* @flow */

import React, {Component, PropTypes} from 'react';

import _ from 'lodash';

import Immutable from 'immutable';
import ImmutableObserver from 'meteor-immutable-observer';

import type {Action} from '../../flowtypes/reduxTypes';
import type {Selector, QueryOptions} from '../../flowtypes/meteorTypes';

type Props = {
  collection: Mongo.Collection,
  keyBy?: (document: Immutable.Collection) => string | number | Symbol,
  list?: boolean,
  receiveAction?: (documents: Immutable.Collection) => Action,
  selector?: Selector,
  options?: QueryOptions
};

export default class MongoChangeDispatcher extends Component<void,Props,void> {
  static contextTypes: Object = {
    store: PropTypes.shape({
      dispatch: PropTypes.func.isRequired
    }).isRequired
  };
  autorun: ?Tracker.Computation;
  observer: ?{stop: Function};
  shouldComponentUpdate(nextProps: Props): boolean {
    return nextProps.collection !== this.props.collection ||
        nextProps.keyBy !== this.props.keyBy ||
        nextProps.list !== this.props.list ||
        !_.isEqual(nextProps.selector, this.props.selector) ||
        !_.isEqual(nextProps.options, this.props.options);
  }
  componentWillMount() {
    this.updateObserver();
  }
  componentWillUpdate(nextProps: Props) {
    this.updateObserver(nextProps);
  }
  updateObserver: (props?: Props) => void = (props = this.props) => {
    if (this.autorun) this.autorun.stop();
    if (this.observer) this.observer.stop();

    let {collection, keyBy, list, receiveAction, selector, options} = props;
    let {store: {dispatch}} = this.context;

    let name = collection._name;
    let actionType = 'SET_' + _.snakeCase(name).toUpperCase();
    
    let observer = this.observer = keyBy ?
      ImmutableObserver.IndexBy(collection.find(selector || {}, options || {}), keyBy) :
      list ?
        ImmutableObserver.List (collection.find(selector || {}, options || {})) :
        ImmutableObserver.Map  (collection.find(selector || {}, options || {}));

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
