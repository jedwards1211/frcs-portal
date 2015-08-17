import React from 'react';

import _ from 'lodash';

export default class UpdateThrottler extends React.Component {
  constructor(props) {
    super(props);
    this.updateLater = _.throttle(this.forceUpdate, props.wait);
  }
  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.wait !== this.props.wait) {
      this.updateLater = _.throttle(this.forceUpdate, nextProps.wait);
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    this.updateLater();
    return false;
  }
  render() {
    return React.cloneElement(this.props.children, this.props);
  }
}

export function throttleUpdates(Component, wait) {
  return class UpdateThrottler extends React.Component {
    constructor(props) {
      super(props);
      this.updateLater = _.throttle(this.forceUpdate, wait);
    }
    shouldComponentUpdate(nextProps, nextState) {
      this.updateLater();
      return false;
    }
    render() {
      return <Component {...this.props}/>;
    }
  };
}