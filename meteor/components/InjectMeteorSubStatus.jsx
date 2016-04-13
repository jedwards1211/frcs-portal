/* @flow */

import Immutable from 'immutable';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import createOrCloneElement from '../../utils/createOrCloneElement';

type Props = {
  subKeys: string[],
  ready?: boolean,
  error?: Error,
  children: any
};

class InjectMeteorSubStatus extends Component<void,Props,void> {
  render(): ?React.Element {
    let {ready, error, children} = this.props;
    return createOrCloneElement(children, {ready, error, loading: ready !== true, loadError: error});
  }
}

const select = createSelector(
  state => state.get('subscriptions'),
  (state, props) => props.subKeys,
  (subscriptions = Immutable.Map(), subKeys) => subKeys.reduce((status, subKey) => {
    return {
      ready: status.ready && !!subscriptions.getIn([subKey, 'ready']),
      error: status.error || subscriptions.getIn([subKey, 'error'])
    };
  }, {ready: true, error: undefined})
);

export default connect(select)(InjectMeteorSubStatus);
