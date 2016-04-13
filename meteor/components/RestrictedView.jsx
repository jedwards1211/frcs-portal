/* @flow */

import React, {Component} from 'react';
import _ from 'lodash';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import createOrCloneElement from '../../utils/createOrCloneElement';

import Glyphicon from '../../bootstrap/Glyphicon.jsx';
import Fader from '../../common/Fader.jsx';
import Alert from '../../bootstrap/Alert.jsx';

import ReduxLoginView from './ReduxLoginView.jsx';

import {createSkinDecorator} from 'react-skin';

type Props = {
  requiredRoles?: string | string[],
  requiredRolesToWrite?: string | string[],
  loggedIn: boolean,
  isAuthorized: boolean,
  isReadOnly: boolean,
  children: any
};

const ForbiddenDecorator = createSkinDecorator({
  Title: (Title, props) => <Title {...props}>Access Denied</Title>,
  Body: (Body, props, decorator) => {
    let {requiredRoles} = decorator.props;
    return <Body {...props}>
      <Alert warning>{`You must be logged in as an ${requiredRoles instanceof Array ? '[' + requiredRoles.join(', ') + ']' : requiredRoles} user to access this page`}</Alert>
      {props.children}
    </Body>
  }
});

const ReadOnlyDecorator = createSkinDecorator({
  Body: (Body, props, decorator) => {
    let {requiredRolesToWrite} = decorator.props;
    return <Body {...props}>
      <Alert warning><Glyphicon lock/>
        You must be logged in as an {requiredRolesToWrite instanceof Array ? `[${requiredRolesToWrite.join(', ')}]` : requiredRolesToWrite}
        user to edit this view</Alert>
      {props.children}
    </Body>;
  }
});

const UnauthorizedDecorator = createSkinDecorator({
  Body: (Body, props, decorator) => <Body {...props}>
    <Alert warning>{"You must be logged in to access this page"}</Alert>
    {props.children}
  </Body>
});

class RestrictedView extends Component<void,Props,void> {
  render(): React.Element {
    let {loggedIn, isAuthorized, isReadOnly, requiredRoles, requiredRolesToWrite, children, ...props} = this.props;

    let content;

    if (isAuthorized) {
      if (isReadOnly) {
        content = <ReadOnlyDecorator key="readOnly" requiredRolesToWrite={requiredRolesToWrite}>
          {createOrCloneElement(children, {...props, readOnly: true})}
        </ReadOnlyDecorator>;
      }
      else {
        content = createOrCloneElement(children, {...props, key: 'allowed'});
      }
    }
    else if (loggedIn) {
      content = <ForbiddenDecorator key="forbidden" requiredRoles={requiredRoles}>
        <ReduxLoginView/>
      </ForbiddenDecorator>;
    }
    else {
      content = <UnauthorizedDecorator key="unauthorized">
        <ReduxLoginView/>
      </UnauthorizedDecorator>;
    }

    return <Fader>{content}</Fader>;
  }
}

const select = createSelector(
  (state, props) => props.requiredRoles || [],
  (state, props) => props.requiredRolesToWrite || [],
  state => state.get('user'),
  (requiredRoles, requiredRolesToWrite, user) => {
    if (!(requiredRoles instanceof Array)) requiredRoles = [requiredRoles];
    return {
      loggedIn: !!user,
      isAuthorized: !!user && _.every(requiredRoles, role => Roles.userIsInRole(user.get('_id'), role)),
      isReadOnly: !!user && !_.every(requiredRolesToWrite, role => Roles.userIsInRole(user.get('_id'), role))
    };
  }
);

const ReduxRestrictedView = connect(select)(RestrictedView);

export default ReduxRestrictedView;

export function restrict(requiredRoles?: string | string[]): (content: React.Element) => (props: Object) => React.Element {
  return content => props => <ReduxRestrictedView {...props} requiredRoles={requiredRoles}>
    {content}
  </ReduxRestrictedView>;
}
