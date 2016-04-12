import React, {Component} from 'react';
import Immutable from 'immutable';
import {connect} from 'react-redux';
import dispatchAutobindFieldChanges from '../../Autobind/dispatchAutobindFieldChanges';

import LoginView from '../../common/LoginView';

import * as actions from '../actions/userActions';

class ReduxLoginView extends Component {
  onSubmit: () => void = () => {
    let {username, password, dispatch} = this.props;
    dispatch(actions.setLoginError(undefined));
    Meteor.loginWithPassword(username, password, err => dispatch(actions.setLoginError(err)));
  };
  onLogout: () => void = () => {
    let {dispatch} = this.props;
    dispatch(actions.setLogoutError(undefined));
    Meteor.logout(err => dispatch(actions.setLogoutError(err)));
  };
  render(): ReactElement {
    let {onSubmit, onLogout, props: {dispatch}} = this;
    return <LoginView {...this.props} onSubmit={onSubmit}
                                      onLogout={onLogout}
                      onAutobindFieldChange={dispatchAutobindFieldChanges(dispatch, 
                        {meta: {reduxPath: ['LoginView']}, actionTypePrefix: 'LOGIN_VIEW.'})}/>;
  }
}

function select(state) {
  let viewState = state.get('LoginView') || Immutable.Map();
  return {
    user: state.get('user'),
    loggingIn: state.get('loggingIn'),
    loginError: state.get('loginError'),
    ...viewState.toJS()
  }
}

export default connect(select)(ReduxLoginView);
