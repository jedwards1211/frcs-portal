/* @flow */

import React, {Component} from 'react';
import _ from 'lodash';

import Autobind from '../Autobind/Autobind.jsx';
import Form from '../bootstrap/Form';
import Button from '../bootstrap/Button';
import Input from '../bootstrap/Input';

import Spinner from './Spinner';
import AlertGroup from './AlertGroup';

import {View, Header, Title, Body, Footer} from './View.jsx';

import {testPasswordStrengthForUI} from '../utils/testPasswordStrength';

import type {FormValidation} from '../flowtypes/validationTypes';

import './ChangePasswordView.sass';

export type Props = {
  disabled?: boolean,
  changingPassword?: boolean,
  changePasswordError?: any,
  oldPassword?: string,
  newPassword?: string,
  retypeNewPassword?: string,
  onOldPasswordChange: Function,
  onNewPasswordChange: Function,
  onRetypeNewPasswordChange: Function,
  onSubmit: Function,
};

export default class ChangePasswordView extends Component {
  props: Props;
  static defaultProps: {
    onOldPasswordChange: () => void,
    onNewPasswordChange: () => void,
    onRetypeNewPasswordChange: () => void,
    onSubmit: () => void,
  } = {
    onOldPasswordChange() {},
    onNewPasswordChange() {},
    onRetypeNewPasswordChange() {},
    onSubmit() {}
  };
  oldPasswordInput: any;
  componentDidMount(): void {
    if (this.oldPasswordInput) {
      this.oldPasswordInput.focus();
    }
  }
  validate: () => FormValidation = () => {
    let {oldPassword, newPassword, retypeNewPassword} = this.props;

    let result = {};
    if (!oldPassword) {
      result.valid = false;
    }
    if (!newPassword || !retypeNewPassword) {
      result.valid = false;
    }
    else if (retypeNewPassword !== newPassword) {
      result.retypeNewPassword = {error: 'Passwords do not match'};
    }

    if (oldPassword && newPassword && oldPassword === newPassword) {
      result.newPassword = {error: 'New password must be different from old password'};
    }
    else if (newPassword) {
      result.newPassword = testPasswordStrengthForUI(newPassword);
    }

    if (result.valid !== false) {
      result.valid = !_.some(result, v => v.error);
    }
    return result;
  };
  canSave: () => boolean = () => {
    return this.validate().valid && !this.props.changingPassword;
  };
  onSubmit: () => void = (e) => {
    e.preventDefault();
    if (this.canSave()) {
      let {oldPassword, newPassword, onSubmit} = this.props;
      onSubmit(oldPassword, newPassword);
    }
  };
  render(): ?ReactElement {
    let {disabled, changingPassword, changePasswordError} = this.props;
    let {onSubmit} = this;

    let validation = this.validate();
    let alerts = {};
    if (changePasswordError) alerts.changePasswordError = {error: changePasswordError};

    disabled = disabled || changingPassword;

    return <View className="mf-change-password-view">
      <Autobind data={this.props} callbacks={this.props} metadata={{validation}}
                omnidata={disabled ? {disabled} : undefined}>
        <Form onSubmit={onSubmit} labelClass="lbl" controlClass="control">
          <Header>
            <Title>Change Password</Title>
          </Header>
          <Body>
            <fieldset disabled={disabled}>
              <Input formGroup label="Old Password" autobindField="oldPassword"
                     type="password" ref={c => this.oldPasswordInput = c}/>

              <Input formGroup label="New Password" autobindField="newPassword"
                     type="password"/>

              <Input formGroup label="Retype New Password" autobindField="retypeNewPassword"
                     type="password"/>
            </fieldset>
          </Body>

          <Footer>
            <AlertGroup className="alerts" alerts={alerts}/>
            <Button submit primary disabled={!this.canSave()}>
              {changingPassword ? <span><Spinner/> Saving...</span> : 'Change Password'}
            </Button>
          </Footer>
        </Form>
      </Autobind>
    </View>;
  }
}
