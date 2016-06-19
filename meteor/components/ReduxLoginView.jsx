/* @flow */

import React, {Component} from 'react'
import * as Immutable from 'immutable'
import {connect} from 'react-redux'
import {createSetter, createDispatcher} from 'redux-setters'

import LoginView from '../../common/LoginView'

import * as actions from '../actions/userActions'

const reduxPath = ['LoginView']
const ACTION_TYPE_PREFIX = 'LOGIN_VIEW'

const set = createSetter(reduxPath, {domain: ACTION_TYPE_PREFIX})

class ReduxLoginView extends Component {
  onSubmit: () => void = () => {
    let {username, password, dispatch} = this.props
    dispatch(actions.setLoginError(undefined))
    Meteor.loginWithPassword(username, password, err => dispatch(actions.setLoginError(err)))
  };
  onLogout: () => void = () => {
    let {dispatch} = this.props
    dispatch(actions.setLogoutError(undefined))
    Meteor.logout(err => dispatch(actions.setLogoutError(err)))
  };
  render(): React.Element {
    let {onSubmit, onLogout, props: {dispatch}} = this
    return <LoginView {...this.props} onSubmit={onSubmit}
        onLogout={onLogout}
        onFieldChange={createDispatcher(dispatch, set)}
           />
  }
}

function select(state) {
  let viewState = state.getIn(reduxPath) || Immutable.Map()
  return {
    user: state.get('user'),
    loggingIn: state.get('loggingIn'),
    loginError: state.get('loginError'),
    ...viewState.toJS()
  }
}

export default connect(select)(ReduxLoginView)
