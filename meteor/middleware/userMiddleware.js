/* @flow */

import {createMiddleware} from 'mindfront-redux-utils';

import * as actions from '../actions/userActions';

export default createMiddleware({
  [actions.LOGIN_WITH_PASSWORD]: store => next => action => {
    let {username, password} = action.payload;
    store.dispatch(actions.setLoginError(undefined));
    Meteor.loginWithPassword(username, password, err => store.dispatch(actions.setLoginError(err)));
    return next(action);
  },
  [actions.LOGOUT]: store => next => action => {
    store.dispatch(actions.setLogoutError(undefined));
    Meteor.logout(err => store.dispatch(actions.setLogoutError(err)));
    return next(action);
  }
});
