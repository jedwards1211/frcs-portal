import React, {Component} from 'react';
import {connect} from 'react-redux';

import Alert from '../../bootstrap/Alert';
import Spinner from '../../common/Spinner';

import * as actions from '../actions/userActions';

class ReduxLogoutView extends Component {
  componentWillMount() {
    let {dispatch} = this.props;
    dispatch(actions.setLogoutError(undefined));
    Meteor.logout(err => dispatch(actions.setLogoutError(err)));
  }
  render() {
    let {logoutError} = this.props;

    if (logoutError) {
      return <Alert error={logoutError}/>;
    }

    return <Alert info><Spinner/> Logging out...</Alert>;
  }
}

function select(state) {
  return {
    logoutError: state.getIn(['meteorState', 'logoutError'])
  };
}

export default connect(select)(ReduxLogoutView);
