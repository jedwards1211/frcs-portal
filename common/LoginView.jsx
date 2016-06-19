/* @flow */

import React, {Component} from 'react'
import {findDOMNode} from 'react-dom'
import classNames from 'classnames'
import {TransitionListener} from 'react-transition-context'

import Spinner from './Spinner'
import AlertGroup from './AlertGroup'
import Form from '../bootstrap/Form.jsx'
import Input from '../bootstrap/Input.jsx'
import Button from '../bootstrap/Button.jsx'
import Alert from '../bootstrap/Alert.jsx'
import bindData from 'react-bind-data'
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
  usernameInput: ?HTMLInputElement;

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
  didComeIn: Function = () => {
    const {onFieldChange} = this.props
    if (onFieldChange) {
      onFieldChange(['username'], '')
      onFieldChange(['password'], '')
    }
    const {usernameInput} = this
    if (usernameInput) {
      usernameInput.focus()
      usernameInput.select()
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
      const data = bindData({
        data: this.props,
        metadata: {validation},
        omnidata: loggingIn ? {disabled: true} : undefined,
        onFieldChange
      })
      content = <Form key="login" onSubmit={this.onSubmit}>
        <Body>
          <Input type="text" placeholder="Username" {...data('username')}
              ref={c => this.usernameInput = findDOMNode(c)}
          />
          <Input type="password" placeholder="Password" {...data('password')} />
        </Body>
        <Footer>
          <Button submit primary disabled={loggingIn || !validation.valid}>
            {loggingIn ? <span><Spinner /> Logging in...</span> : 'Log in'}
          </Button>
          <AlertGroup alerts={alerts} />
        </Footer>
        <TransitionListener didComeIn={this.didComeIn} />
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
