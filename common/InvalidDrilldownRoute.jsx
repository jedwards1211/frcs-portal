/* @flow */

import React, {Component} from 'react';

import {Route} from './Drilldown.jsx';

import Alert from '../bootstrap/Alert.jsx';

import {View, Header, Title, Body} from './View.jsx';

type Props = {
  path: string,
  title?: string
};

export default class InvalidDrilldownRoute extends Component<void,Props,void> {
  render(): React.Element {
    let {path, title} = this.props;

    return <Route path={path}>
      <View>
        <Header>
          <Title>
            {title || 'Invalid Route'}
          </Title>
        </Header>
        <Body>
          <Alert danger>
            Invalid route: {path}
          </Alert>
        </Body>
      </View>
    </Route>;
  }
}
