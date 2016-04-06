/* @flow */

import React, {Component, PropTypes} from 'react';

import Immutable from 'immutable';

import * as actions from './../actions/userActions';

export default class UserChangeDispatcher extends Component<void,void,void> {
  static contextTypes = {
    store: PropTypes.shape({
      dispatch: PropTypes.func.isRequired
    }).isRequired
  };
  autorun: ?Tracker.Computation;
  componentWillMount() {
    let {store: {dispatch}} = this.context;

    this.autorun = Tracker.autorun(function() {
      let user = Immutable.fromJS(Meteor.user());
      let loggingIn = Meteor.loggingIn();
      Tracker.nonreactive(function () {
        dispatch(actions.setUser(user));
        dispatch(actions.setLoggingIn(loggingIn));
      });
    });
  };
  componentWillUnmount() {
    if (this.autorun) this.autorun.stop();
  }
  render(): ReactElement {
    return <span/>;
  }
}
