/* @flow */

import React, {Component} from 'react';
import _ from 'lodash';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import createOrCloneElement from '../../utils/createOrCloneElement';

import Fader from '../../common/Fader.jsx';
import Alert from '../../bootstrap/Alert.jsx';

import ReduxLoginView from './ReduxLoginView.jsx';

import {createSkinDecorator} from 'react-skin';

type Props = {
  requiredRoles?: string | string[],
  loggedIn: boolean,
  isAuthorized: boolean,
  children: any
};

const ForbiddenDecorator = createSkinDecorator({
  Title: (Title, props) => <Title>Access Denied</Title>,
  Body: (Body, props, decorator) => <Body {...props}>
    <Alert warning>{"You don't have privileges to access the requested content."}</Alert>
    {props.children}
  </Body>
});

const UnauthorizedDecorator = createSkinDecorator({
  Title: (Title, props) => <Title>Please Log In</Title> ,
  Body: (Body, props, decorator) => <Body {...props}>
    <Alert warning>{"You must be logged in to access the requested content."}</Alert>
    {props.children}
  </Body>
});

class RestrictedView extends Component<void,Props,void> {
  render(): ReactElement {
    let {loggedIn, isAuthorized, children, ...props} = this.props;

    let content;

    if (isAuthorized) {
      content = <div key="allowed">
        {createOrCloneElement(children, props)}
      </div>;
    }
    else if (loggedIn) {
      content = <ForbiddenDecorator key="forbidden">
        <ReduxLoginView/>
      </ForbiddenDecorator>;
    }
    else {
      return <UnauthorizedDecorator key="unauthorized">
        <ReduxLoginView/>
      </UnauthorizedDecorator>;
    }

    return <Fader>{content}</Fader>;
  }
}

const select = createSelector(
  (state, props) => props.requiredRoles || [],
  state => state.get('user'),
  (requiredRoles, user) => {
    if (!(requiredRoles instanceof Array)) requiredRoles = [requiredRoles];
    return {
      loggedIn: !!user,
      isAuthorized: !!user && _.every(requiredRoles, role => Roles.userIsInRole(user.get('_id'), role))
    };
  }
);

const ReduxRestrictedView = connect(select)(RestrictedView);

export default ReduxRestrictedView;

export function restrict(requiredRoles?: string | string[]): (content: ReactElement) => (props: Object) => ReactElement {
  return content => props => <ReduxRestrictedView {...props} requiredRoles={requiredRoles}>
    {content}
  </ReduxRestrictedView>;
}
