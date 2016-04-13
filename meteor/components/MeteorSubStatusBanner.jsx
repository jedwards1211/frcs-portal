/* @flow */

import Immutable from 'immutable';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import Alert from '../../bootstrap/Alert.jsx';
import Spinner from '../../common/Spinner.jsx';

type Props = {
  subKeys: string[],
  ready?: boolean,
  error?: Error
};

class MeteorSubStatusBanner extends Component<void,Props,void> {
  render(): ?React.Element {
    let {ready, error} = this.props;
    
    if (ready !== true) {
      return <Alert info><Spinner/> Loading...</Alert>;
    }
    if (error) {
      return <Alert error={error}/>;
    }
     
    return null;
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

export default connect(select)(MeteorSubStatusBanner);
