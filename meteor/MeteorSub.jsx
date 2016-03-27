/* @flow */

import React, {Component, PropTypes} from 'react';
import _ from 'lodash';

import type {SubscriptionHandle} from '../flowtypes/meteorTypes';

import * as actions from './meteorActions';

type Props = {
  name: string,
  subKey: string | Symbol,
  args?: any[]
};

export default class MeteorSub extends Component<void,Props,void> {
  static contextTypes = {
    store: PropTypes.shape({
      dispatch: PropTypes.func.isRequired   
    }).isRequired
  };
  subscription: ?SubscriptionHandle;
  shouldComponentUpdate(nextProps: Props): boolean {
    return this.props.name !== nextProps.name ||
        this.props.subKey !== nextProps.subKey ||
        !_.isEqual(this.props.args, nextProps.args);
  }
  componentWillMount() {
    this.updateSub();
  }
  componentWillUpdate() {
    this.updateSub();
  }
  updateSub: Function = () => {
    let {name, subKey} = this.props;
    let {store: {dispatch}} = this.context;
    let args = this.props.args || [];
    
    if (this.subscription) {
      this.subscription.stop();
    }
    this.subscription = Meteor.subscribe(name, ...args, {
      onStop:   err => dispatch(actions.setSubscriptionStatus(subKey, {ready: false, error: err})),
      onReady:  ()  => dispatch(actions.setSubscriptionStatus(subKey, {ready: true}))
    });
  };
  componentWillUnmount() {
    let {subKey} = this.props;
    let {store: {dispatch}} = this.context;
    if (this.subscription) {
      this.subscription.stop();
      this.subscription = undefined;
    }
    dispatch(actions.deleteSubscriptionStatus(subKey));
  }
  render(): ReactElement {
    return <span/>;
  }
}
