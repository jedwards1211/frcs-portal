/* @flow */

import React, {Component, PropTypes} from 'react'
import * as Immutable from 'immutable'
import {connect} from 'react-redux'

import type {Dispatch} from '../../flowtypes/reduxTypes'

import * as actions from '../actions/changePasswordActions'

import {dispatchFieldChanges, actions as bindDataActions} from 'react-bind-data-redux'
const {setField} = bindDataActions

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

const meta = {
  reduxPath: ['ChangePasswordView']
}
const actionTypePrefix = 'CHANGE_PASSWORD_VIEW.'

const dispatchOptions = {meta, actionTypePrefix}

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
    dispatch(setField(["oldPassword"], undefined, dispatchOptions))
    dispatch(setField(["newPassword"], undefined, dispatchOptions))
    dispatch(setField(["retypeNewPassword"], undefined, dispatchOptions))
  }
  render() {
    let {onSubmit, props: {dispatch}} = this
    return <ChangePasswordView  {...this.props} onSubmit={onSubmit}
        onFieldChange={dispatchFieldChanges(dispatch, dispatchOptions)}
           />
  }
}

function select(state) {
  let viewState = state.get('ChangePasswordView') || Immutable.Map()
  return {
    ...viewState.toObject(),
    changingPassword: state.get('changingPassword'),
    changePasswordError: state.get('changePasswordError')
  }
}

export default connect(select)(ReduxChangePasswordView)
