/* @flow */

import React, {Component} from 'react';
import {connect} from 'react-redux';
import shallowEqual from 'fbjs/lib/shallowEqual';

import type {Dispatch} from '../flowtypes/reduxTypes';
import type {SubscriptionHandle} from '../flowtypes/meteorTypes';

import * as actions from './meteorActions';

type Props = {
  name: string,
  subKey: string | Symbol,
  args?: any[],
  dispatch: Dispatch
};

type DefaultProps = {
  dispatch: Dispatch
};

class MeteorSub extends Component<DefaultProps,Props,void> {
  subscription: ?SubscriptionHandle;
  static defaultProps = {
    dispatch() {}
  };
  shouldComponentUpdate(nextProps: Props) {
    return this.props.name !== nextProps.name ||
        this.props.subKey !== nextProps.subKey ||
        !shallowEqual(this.props.args, nextProps.args);
  }
  componentWillMount() {
    this.updateSub();
  }
  componentWillUpdate() {
    this.updateSub();
  }
  updateSub: Function = () => {
    let {name, subKey, dispatch} = this.props;
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
    let {dispatch, subKey} = this.props;
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

export default connect(() => ({}))(MeteorSub);
