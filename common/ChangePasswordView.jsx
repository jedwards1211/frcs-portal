/* @flow */

import React, {Component} from 'react'
import _ from 'lodash'
import {TransitionListener} from 'react-transition-context'

import BindData from 'react-bind-data'
import Form from '../bootstrap/Form'
import Button from '../bootstrap/Button'
import Input from '../bootstrap/Input'

import Spinner from './Spinner'
import AlertGroup from './AlertGroup'

import {View, Header, Title, Body, Footer} from './View.jsx'

import {testPasswordStrengthForUI} from '../utils/testPasswordStrength'

import type {FormValidation} from '../flowtypes/validationTypes'

import './ChangePasswordView.sass'

export type Props = {
  disabled?: boolean,
  changingPassword?: boolean,
  changePasswordError?: any,
  oldPassword?: string,
  newPassword?: string,
  retypeNewPassword?: string,
  onFieldChange?: (path: any[], newValue: any) => any,
  onSubmit: (oldPassword: string, newPassword: string) => any,
};

export default class ChangePasswordView extends Component {
  props: Props;
  static defaultProps: {
    onSubmit: (oldPassword: string, newPassword: string) => any,
  } = {
    onOldPasswordChange() {},
    onNewPasswordChange() {},
    onRetypeNewPasswordChange() {},
    onSubmit() {}
  };
  oldPasswordInput: any;
  didComeIn: Function = () => {
    if (this.oldPasswordInput) {
      this.oldPasswordInput.focus()
    }
  };
  validate: () => FormValidation = () => {
    let {oldPassword, newPassword, retypeNewPassword} = this.props

    let result = {}
    if (!oldPassword) {
      result.valid = false
    }
    if (!newPassword || !retypeNewPassword) {
      result.valid = false
    }
    else if (retypeNewPassword !== newPassword) {
      result.retypeNewPassword = {error: 'Passwords do not match'}
    }

    if (oldPassword && newPassword && oldPassword === newPassword) {
      result.newPassword = {error: 'New password must be different from old password'}
    }
    else if (newPassword) {
      result.newPassword = testPasswordStrengthForUI(newPassword)
    }

    if (result.valid !== false) {
      result.valid = !_.some(result, v => v.error)
    }
    return result
  };
  canSave: () => boolean = () => {
    return this.validate().valid && !this.props.changingPassword
  };
  onSubmit: (e: any) => void = (e) => {
    e.preventDefault()
    if (this.canSave()) {
      let {oldPassword, newPassword, onSubmit} = this.props
      if (oldPassword && newPassword && onSubmit) {
        onSubmit(oldPassword, newPassword)
      }
    }
  };
  render(): ?React.Element {
    let {disabled, changingPassword, changePasswordError, onFieldChange} = this.props
    let {onSubmit} = this

    let validation = this.validate()
    let alerts = {}
    if (changePasswordError) alerts.changePasswordError = {error: changePasswordError}

    disabled = disabled || changingPassword

    return <View className="mf-change-password-view">
      <BindData data={this.props} onFieldChange={onFieldChange} metadata={{validation}}
          omnidata={disabled ? {disabled} : undefined}
      >
        <Form onSubmit={onSubmit} labelClass="lbl" controlClass="control">
          <Header>
            <Title>Change Password</Title>
          </Header>
          <Body>
            <fieldset disabled={disabled}>
              <Input formGroup label="Old Password" name="oldPassword"
                  type="password" ref={c => this.oldPasswordInput = c}
              />

              <Input formGroup label="New Password" name="newPassword"
                  type="password"
              />

              <Input formGroup label="Retype New Password" name="retypeNewPassword"
                  type="password"
              />
            </fieldset>
          </Body>

          <Footer>
            <AlertGroup className="alerts" alerts={alerts} />
            <Button submit primary disabled={!this.canSave()}>
              {changingPassword ? <span><Spinner /> Saving...</span> : 'Change Password'}
            </Button>
          </Footer>
        </Form>
      </BindData>
      <TransitionListener didComeIn={this.didComeIn} />
    </View>
  }
}
