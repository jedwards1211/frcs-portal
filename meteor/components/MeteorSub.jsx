/* @flow */

import React, {Component, PropTypes} from 'react'
import _ from 'lodash'

import type {SubscriptionHandle} from '../../flowtypes/meteorTypes'

import * as actions from './../actions/meteorSubcriptionActions'

type Props = {
  name: string,
  subKey?: string | Symbol,
  args?: any[]
};

export default class MeteorSub extends Component<void, Props, void> {
  static contextTypes = {
    store: PropTypes.shape({
      dispatch: PropTypes.func.isRequired
    }).isRequired
  };
  subscription: ?SubscriptionHandle;
  shouldComponentUpdate(nextProps: Props): boolean {
    return this.props.name !== nextProps.name ||
        this.props.subKey !== nextProps.subKey ||
        !_.isEqual(this.props.args, nextProps.args)
  }
  componentWillMount() {
    this.updateSub()
  }
  componentWillUpdate(nextProps: Props) {
    this.updateSub(nextProps)
  }
  updateSub: (props?: Props) => void = (props = this.props) => {
    let {name} = props
    let subKey = this.props.subKey || name
    let {store: {dispatch}} = this.context
    let args = props.args || []

    if (this.subscription) {
      this.subscription.stop()
    }
    dispatch(actions.setSubscriptionStatus(subKey, {ready: false, error: undefined}))
    this.subscription = Meteor.subscribe(name, ...args, {
      onStop:   err => dispatch(actions.setSubscriptionStatus(subKey, {ready: false, error: err})),
      onReady:  ()  => dispatch(actions.setSubscriptionStatus(subKey, {ready: true}))
    })
  };
  componentWillUnmount() {
    let {name} = this.props
    let subKey = this.props.subKey || name
    let {store: {dispatch}} = this.context
    if (this.subscription) {
      this.subscription.stop()
      this.subscription = undefined
    }
    dispatch(actions.deleteSubscriptionStatus(subKey))
  }
  render(): ?React.Element {
    return null
  }
}
