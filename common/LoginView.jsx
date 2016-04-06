/* @flow */

import React, {Component} from 'react';
import classNames from 'classnames';

import {Link} from 'react-router';
import Spinner from './Spinner';
import AlertGroup from './AlertGroup';
import Form from '../bootstrap/Form.jsx';
import Input from '../bootstrap/Input.jsx';
import Button from '../bootstrap/Button.jsx';
import Alert from '../bootstrap/Alert.jsx';
import Autobind from '../Autobind/Autobind.jsx';
import Fader from './Fader.jsx';
import {View, Header, Title, Body, Footer} from './View.jsx';

import type {FormValidation} from '../flowtypes/validationTypes';

import './LoginView.sass';

type Props = {
  className?: string,
  user?: any,  
  loggingIn?: boolean,
  loginError?: Error,
  username?: string,
  password?: string,
  onSubmit?: (username: string, password: string) => any,
  onUsernameChange?: (username: string) => any,
  onPasswordChange?: (password: string) => any
};

export default class LoginView extends Component<void,Props,void> {
  validate: () => FormValidation = () => {
    let {username, password} = this.props;
    let result = {};
    if (!username) {
      result.username = {error: 'Please enter a username'};
    }
    if (!password) {
      result.password = {error: 'Please enter a password'};
    }
    result.valid = !Object.keys(result).length;
    return result;
  };
  onSubmit: (e: any) => void = e => {
    e.preventDefault();
    let {username, password, onSubmit} = this.props; 
    if (username && password && onSubmit && this.validate().valid) {
      onSubmit(username, password);
    }
  };
  render(): ReactElement {
    let {className, user, loggingIn, loginError} = this.props;
    className = classNames(className, 'mf-login-view');

    let validation = this.validate();

    let alerts = {};
    if (loginError) {
      alerts.loginError = {error: loginError};
    }
    
    let content;
    if (user) {
      content = <span key="loggedIn">
        <Body>
          <Alert success>
            You are logged in as {user && (user.getIn(['profile', 'name']) || user.get('username'))}.
            &nbsp;<Link to="/logout" className="alert-link">Log out</Link>
          </Alert>  
        </Body>
        <Footer/>
      </span>;
    }
    else {
      content = <Form key="login" onSubmit={this.onSubmit}>
        <Autobind data={this.props} callbacks={this.props} metadata={{validation}}
                  omnidata={loggingIn ? {disabled: true} : undefined}>
          <Body>
            <Input type="text" placeholder="Username" autobindField="username"/>
            <Input type="text" placeholder="Password" autobindField="password"/>
          </Body>
        </Autobind>
        <Footer>
          <Button submit primary disabled={loggingIn || !validation.valid}>
            {loggingIn ? <span><Spinner /> Logging in...</span> : 'Log in'}
          </Button>
          <AlertGroup alerts={alerts}/>
        </Footer>
      </Form>;
    }

    return <View {...this.props} className={className}>
      <Header>
        <Title>Log In</Title>
      </Header>
      <Fader>{content}</Fader>
    </View>;
  }
}
