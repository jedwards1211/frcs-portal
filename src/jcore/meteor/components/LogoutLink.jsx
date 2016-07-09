/* @flow */

import React, {Component} from 'react'
import {connect} from 'react-redux'

import * as actions from '../actions/userActions'

class LogoutLink extends Component {
  onClick: () => void = () => {
    let {dispatch} = this.props
    dispatch(actions.setLogoutError(undefined))
    Meteor.logout(err => dispatch(actions.setLogoutError(err)))
  };
  render(): React.Element {
    let {onClick, props: {user}} = this
    return <a style={{cursor: 'pointer'}} onClick={user && onClick}>Log out</a>
  }
}

function select(state) {
  return {
    user: state.get('user')
  }
}

export default connect(select)(LogoutLink)
