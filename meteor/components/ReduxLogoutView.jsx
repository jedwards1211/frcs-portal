import React, {Component} from 'react';
import {connect} from 'react-redux';

import Alert from '../../mindfront-react-components/bootstrap/Alert';
import Spinner from '../../mindfront-react-components/common/Spinner';

import {logout} from '../../mindfront-react-components/meteor/actions/rootActions';

class ReduxLogoutView extends Component {
  componentWillMount() {
    this.props.dispatch(logout());
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
    logoutError: state.getIn(['meteorState', 'logoutError']),
  };
}

export default connect(select)(ReduxLogoutView);
