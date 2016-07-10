/* @flow */

import React, {Component, PropTypes} from 'react'
import * as Immutable from 'immutable'
import {connect} from 'react-redux'
import {createSetter, createDispatcher} from 'redux-setters'

import type {Dispatch} from '../../flowtypes/reduxTypes'

import * as actions from '../actions/changePasswordActions'

import ChangePasswordView from '../../common/ChangePasswordView'

type Props = {
  disabled?: boolean,
  changingPassword?: boolean,
  error?: any,
  oldPassword?: string,
  newPassword?: string,
  retypeNewPassword?: string,
  dispatch: Dispatch,
};

const ACTION_TYPE_PREFIX = 'CHANGE_PASSWORD_VIEW'
const reduxPath = ['ChangePasswordView']

const set = createSetter(reduxPath, {domain: ACTION_TYPE_PREFIX})
const {setOldPassword, setNewPassword, setRetypeNewPassword} = set.subs([
  ['oldPassword'],
  ['newPassword'],
  ['retypeNewPassword']
])

class ReduxChangePasswordView extends Component {
  props: Props;
  static defaultProps: {};
  static contextTypes = {
    router: PropTypes.object
  };
  onSubmit: (oldPassword: string, newPassword: string) => void = (oldPassword, newPassword) => {
    let {dispatch} = this.props
    dispatch(actions.setChangingPassword(false))
    dispatch(actions.setChangePasswordError(undefined))
    Accounts.changePassword(oldPassword, newPassword, (err) => {
      dispatch(actions.setChangePasswordError(err))
      dispatch(actions.setChangingPassword(false))
      if (!err) {
        let {router} = this.context
        router && router.goBack()
      }
    })
  };
  componentWillMount() {
    let {dispatch} = this.props
    dispatch(setOldPassword(undefined))
    dispatch(setNewPassword(undefined))
    dispatch(setRetypeNewPassword(undefined))
  }
  render() {
    let {onSubmit, props: {dispatch}} = this
    return <ChangePasswordView  {...this.props} onSubmit={onSubmit}
        onFieldChange={createDispatcher(dispatch, set)}
           />
  }
}

function select(state) {
  let viewState = state.getIn(reduxPath) || Immutable.Map()
  return {
    ...viewState.toObject(),
    changingPassword: state.get('changingPassword'),
    changePasswordError: state.get('changePasswordError')
  }
}

export default connect(select)(ReduxChangePasswordView)
