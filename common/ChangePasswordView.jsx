/* @flow */

import React, {Component} from 'react'
import classNames from 'classnames'
import _ from 'lodash'
import {TransitionListener} from 'react-transition-context'
import Responsive from '../../jcore-react-components/common/Responsive.jsx'

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

export type DefaultProps = {
  requireOldPassword: boolean,
  onSubmit: (oldPassword: string, newPassword: string) => any,
};

export type Props = {
  className?: string,
  disabled?: boolean,
  changingPassword?: boolean,
  changePasswordError?: any,
  requireOldPassword: boolean,
  oldPassword?: string,
  newPassword?: string,
  retypeNewPassword?: string,
  onFieldChange?: (path: any[], newValue: any) => any,
  onSubmit: (oldPassword: string, newPassword: string) => any,
};

export default class ChangePasswordView extends Component<DefaultProps, Props, void> {
  props: Props;
  static defaultProps = {
    onOldPasswordChange() {},
    onNewPasswordChange() {},
    onRetypeNewPasswordChange() {},
    onSubmit() {},
    requireOldPassword: true
  };
  oldPasswordInput: any;
  didComeIn: Function = () => {
    if (this.oldPasswordInput) {
      this.oldPasswordInput.focus()
    }
  };
  validate: () => FormValidation = () => {
    let {requireOldPassword, oldPassword, newPassword, retypeNewPassword} = this.props

    let result = {}
    if (!oldPassword && requireOldPassword) {
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
      if (newPassword && onSubmit) {
        onSubmit(oldPassword || newPassword, newPassword)
      }
    }
  };
  render(): ?React.Element {
    let {disabled, changingPassword, changePasswordError, onFieldChange, requireOldPassword} = this.props
    let {onSubmit} = this
    let className = classNames(this.props.className, "mf-change-password-view")

    let validation = this.validate()
    let alerts = {}
    if (changePasswordError) alerts.changePasswordError = {error: changePasswordError}

    disabled = disabled || changingPassword

    return <View {...this.props} className={className}>
      <Header>
        <Title>Change Password</Title>
      </Header>
      <Body>
      {/* flow-issue(jcore-portal) */}
        <Responsive domProps={['offsetWidth']}>
          {({offsetWidth}) => {
            const labelClass = offsetWidth <= 400 ? 'lbl' : 'lbl col-lg-4'
            const controlClass = offsetWidth <= 400 ? 'control' : 'control col-lg-8'
            return (
              <BindData data={this.props} onFieldChange={onFieldChange} metadata={{validation}}
                  omnidata={disabled ? {disabled} : undefined}
              >
                <Form horizontal labelClass={labelClass} controlClass={controlClass} onSubmit={onSubmit}>
                  <fieldset disabled={disabled}>
                    {requireOldPassword &&
                    <Input formGroup label="Old Password" name="oldPassword"
                        type="password" ref={c => this.oldPasswordInput = c}
                    />
                    }

                    <Input formGroup label="New Password" name="newPassword"
                        type="password"
                    />

                    <Input formGroup label="Retype New Password" name="retypeNewPassword"
                        type="password"
                    />
                  </fieldset>
                </Form>
              </BindData>
            )
          }}
        </Responsive>
      </Body>
      <Footer>
        <AlertGroup className="alerts" alerts={alerts} />
        <Button submit primary disabled={!this.canSave()} onClick={this.onSubmit}>
          {changingPassword ? <span><Spinner /> Saving...</span> : 'Change Password'}
        </Button>
      </Footer>
      <TransitionListener didComeIn={this.didComeIn} />
    </View>
  }
}
