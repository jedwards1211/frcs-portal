import React, {Component} from 'react';
import Immutable from 'immutable';
import {connect} from 'react-redux';
import dispatchAutobindFieldChanges from '../../Autobind/dispatchAutobindFieldChanges';

import LoginView from '../../common/LoginView';

import * as userActions from '../actions/userActions';

class ReduxLoginView extends Component {
  onSubmit: () => void = () => {
    let {username, password, dispatch} = this.props;
    dispatch(userActions.setLoginError(undefined));
    Meteor.loginWithPassword(username, password, err => dispatch(userActions.setLoginError(err)));
  };
  render(): ReactElement {
    let {onSubmit} = this;
    let {dispatch} = this.props;
    return <LoginView {...this.props} onSubmit={onSubmit}
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
