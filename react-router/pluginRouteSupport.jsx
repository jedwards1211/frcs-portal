/* @flow */

import React from 'react';
import {createRoutes, Route} from 'react-router';
import _ from 'lodash';

import selectPluginRoutes from '../selectors/selectPluginRoutes';
import type {Store} from '../flowtypes/reduxTypes';

/**
 * Creates a <Route> decorator that allows you to use the following props on <Route>s:
 * - getChildRoutesFromStore: like getChildRoutes, but a the given (Redux) store will be passed to it.  Arguments are:
 *   - location: as in getChildRoutes
 *   - store: the Redux store
 *   - cb: the callback to call with an array of <Route>s
 * - pluginChildRoutesKey: if given, will get any child routes from Redux plugins using selectPluginRoutes.
 * 
 * These properties are supported by recursively cloning the decorated <Route> and its descendants and injecting
 * getChildRoutes props that call getChildRoutesFromStore if given, handle pluginChildRoutesKey if given, and call the
 * original getChildRoutes if given.  The routes returned from these methods will also be decorated by this
 * pluginRouteSupport.
 * 
 * @param store the Redux store to use.
 * @returns {decorateTree} a decorator for a <Route>
 */
export default function pluginRouteSupport(store: Store): (routes: any) => any {
  return function decorateTree(routes: any): any {
    if (!routes) return routes;
    return createRoutes(routes).map(route => {
      if (!route) return route;
      const {childRoutes, getChildRoutes, getChildRoutesFromStore, pluginChildRoutesKey} = route;
      const newProps = {};

      if (getChildRoutes || getChildRoutesFromStore || pluginChildRoutesKey) {
        const selectPluginChildRoutes = pluginChildRoutesKey && selectPluginRoutes(pluginChildRoutesKey);
        if (childRoutes) newProps.childRoutes = undefined;
        newProps.getChildRoutes = (location, cb) => {
          const chain = [];
          if (getChildRoutes) chain.push(cb => getChildRoutes(location, cb));
          if (getChildRoutesFromStore) chain.push(cb => getChildRoutesFromStore(location, store, cb));
          if (pluginChildRoutesKey) chain.push(cb => cb(null, selectPluginChildRoutes(store.getState())));
          if (childRoutes) chain.push(cb => cb(null, childRoutes));

          chain.reduceRight(
            (next, getChildRoutes) =>
              (err, childRoutes) => err
                ? next(err)
                : getChildRoutes((err, moreChildRoutes) => 
                  next(err, [...childRoutes || [], ...createRoutes(moreChildRoutes)])),
            (err, childRoutes) => cb(err, childRoutes && decorateTree(childRoutes))
          )(null, [/* init routes */]);
        }
        if (_.size(newProps)) return {...route, ...newProps};
      }
      return route;
    }); 
  }
}
