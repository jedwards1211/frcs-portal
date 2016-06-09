/* @flow */

import React, {Component} from 'react'
import classNames from 'classnames'

import Spinner from './Spinner'
import AlertGroup from './AlertGroup'
import Form from '../bootstrap/Form.jsx'
import Input from '../bootstrap/Input.jsx'
import Button from '../bootstrap/Button.jsx'
import Alert from '../bootstrap/Alert.jsx'
import BindData from 'react-bind-data'
import Fader from './Fader.jsx'
import {View, Header, Title, Body, Footer} from './View.jsx'

import type {FormValidation} from '../flowtypes/validationTypes'

import './LoginView.sass'

type Props = {
  className?: string,
  user?: any,
  loggingIn?: boolean,
  loginError?: Error,
  username?: string,
  password?: string,
  onSubmit?: (username: string, password: string) => any,
  onLogout?: () => any,
  onFieldChange?: (path: any[], newValue: any) => any
};

export default class LoginView extends Component<void, Props, void> {
  validate: () => FormValidation = () => {
    let {username, password} = this.props
    let result = {}
    if (!username) {
      result.username = {error: 'Please enter a username'}
    }
    if (!password) {
      result.password = {error: 'Please enter a password'}
    }
    result.valid = !Object.keys(result).length
    return result
  };
  onSubmit: (e: any) => void = e => {
    e.preventDefault()
    let {username, password, onSubmit} = this.props
    if (username && password && onSubmit && this.validate().valid) {
      onSubmit(username, password)
    }
  };
  render(): React.Element {
    let {className, user, loggingIn, loginError, onLogout, onFieldChange} = this.props
    className = classNames(className, 'mf-login-view')

    let validation = this.validate()

    let alerts = {}
    if (loginError) {
      alerts.loginError = {error: loginError}
    }

    let content
    if (user) {
      content = <span key="loggedIn">
        <Body>
          <Alert success>
            You are logged in as {user && (user.getIn(['profile', 'name']) || user.get('username'))}.
            &nbsp;<a onClick={onLogout} className="alert-link">Log out</a>
          </Alert>
        </Body>
        <Footer />
      </span>
    }
    else {
      content = <Form key="login" onSubmit={this.onSubmit}>
        <BindData data={this.props} onFieldChange={onFieldChange} metadata={{validation}}
            omnidata={loggingIn ? {disabled: true} : undefined}
        >
          <Body>
            <Input type="text" placeholder="Username" name="username" />
            <Input type="password" placeholder="Password" name="password" />
          </Body>
        </BindData>
        <Footer>
          <Button submit primary disabled={loggingIn || !validation.valid}>
            {loggingIn ? <span><Spinner /> Logging in...</span> : 'Log in'}
          </Button>
          <AlertGroup alerts={alerts} />
        </Footer>
      </Form>
    }

    return <View {...this.props} className={className}>
      <Header>
        <Title>{user ? 'Account' : 'Log In'}</Title>
      </Header>
      <Fader>{content}</Fader>
    </View>
  }
}
