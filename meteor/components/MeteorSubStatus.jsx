/* @flow */

import Immutable from 'immutable';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import Alert from '../../bootstrap/Alert.jsx';
import Spinner from '../../common/Spinner.jsx';

import {createSkinDecorator} from 'react-skin';

type Props = {
  inject?: boolean,
  banner?: boolean,
  viewSkin?: boolean,
  skyKey?: string,
  subKeys?: string[],
  ready?: boolean,
  error?: Error,
  children?: any
};

const Banner: (props: Props) => ?React.Element = props => {
  let {ready, error} = props;

  if (ready !== true) {
    return <Alert info><Spinner/> Loading...</Alert>;
  }
  if (error) {
    return <Alert error={error}/>;
  }
  return null;
};

const ViewSkin = createSkinDecorator({
  Body: (Body, props, decorator) => {
    let {ready, error} = decorator.props;
    return <Body {...props}>
      {Banner({ready, error})}
      {ready && !error && props.children}
    </Body>;
  },
  Footer: (Footer, props, decorator) => {
    let {ready, error} = decorator.props;
    return <Footer {...props}>
      {ready && !error && props.children}
    </Footer>;
  }
});

class MeteorSubStatus extends Component<void,Props,void> {
  render(): ?React.Element {
    let {inject, banner, viewSkin, ready, error, children} = this.props;
    
    if (inject) {
      if (children instanceof Function) {
        return children({ready, error});
      }
    }
    else if (banner) {
      return Banner(this.props);
    }
    else if (viewSkin) {
      return <ViewSkin {...this.props}>
        {children}
      </ViewSkin>;
    }

    return null;
  }
}

const select = createSelector(
  state => state.get('subscriptions'),
  (state, props) => props.subKey,
  (state, props) => props.subKeys,
  (subscriptions = Immutable.Map(), subKey, subKeys = []) => {
    if (subKey) subKeys.push(subKey);

    return subKeys.reduce((status, subKey) => {
      return {
        ready: status.ready && !!subscriptions.getIn([subKey, 'ready']),
        error: status.error || subscriptions.getIn([subKey, 'error'])
      };
    }, {ready: true, error: undefined});
  }
);

export default connect(select)(MeteorSubStatus);
