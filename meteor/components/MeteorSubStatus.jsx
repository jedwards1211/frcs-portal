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
  subKey?: string | Symbol,
  subKeys?: Array<any>,
  subDisplayNames?: {[subKey: any]: string},
  loadingSubKeys: Array<any>,
  errorSubKeys: Array<any>,
  ready?: boolean,
  error?: Error,
  children?: any
};

const Banner: (props: Props) => ?React.Element = props => {
  let {ready, error, loadingSubKeys, errorSubKeys} = props;
  let subDisplayNames = props.subDisplayNames || {};

  if (ready !== true) {
    return <Alert info><Spinner/> Loading {loadingSubKeys.map(subKey => subDisplayNames[subKey] || subKey)}...</Alert>;
  }
  if (error) {
    return <Alert error={error}>Failed to load {subDisplayNames[errorSubKeys[0]] || errorSubKeys[0]}: </Alert>;
  }
  return <span/>;
};

const ViewSkin = createSkinDecorator({
  Body: (Body, props, decorator) => {
    let {ready, error} = decorator.props;
    return <Body {...props}>
      {Banner(decorator.props)}
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
    let {inject, banner, viewSkin, ready, error, loadingSubKeys, errorSubKeys, children} = this.props;
    
    if (inject) {
      if (children instanceof Function) {
        return children({ready, error, loadingSubKeys, errorSubKeys});
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

    return <span/>;
  }
}

const select = createSelector(
  state => state.get('subscriptions'),
  (state, props) => props.subKey,
  (state, props) => props.subKeys,
  (subscriptions = Immutable.Map(), subKey, subKeys = []) => {
    if (subKey) subKeys.push(subKey);

    let loadingSubKeys  = subKeys.filter(subKey => !subscriptions.getIn([subKey, 'ready']));
    let errorSubKeys    = subKeys.filter(subKey => subscriptions.getIn([subKey, 'error']));
    let ready           = !loadingSubKeys.length;
    let error           = errorSubKeys.length && subscriptions.getIn([errorSubKeys[0], 'error']);

    return {
      ready,
      error,
      loadingSubKeys,
      errorSubKeys
    };
  }
);

export default connect(select)(MeteorSubStatus);
