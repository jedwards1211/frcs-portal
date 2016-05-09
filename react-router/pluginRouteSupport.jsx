/* @flow */

import React from 'react';
import {Route} from 'react-router';
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
export default function pluginRouteSupport(store: Store): (elem: React.Element) => React.Element {
  return function decorateTree(element: React.Element): React.Element {
    if (element.type === Route) {
      const {children, getChildRoutes, getChildRoutesFromStore, pluginChildRoutesKey} = element.props;
      const newProps = {};

      if (getChildRoutes || getChildRoutesFromStore || pluginChildRoutesKey) {
        const selectPluginChildRoutes = pluginChildRoutesKey && selectPluginRoutes(pluginChildRoutesKey);
        newProps.getChildRoutes = (location, cb) => {
          const chain = [];
          if (getChildRoutes) chain.push(cb => getChildRoutes(location, cb));
          if (getChildRoutesFromStore) chain.push(cb => getChildRoutesFromStore(location, store, cb));
          if (pluginChildRoutesKey) chain.push(cb => cb(selectPluginChildRoutes(store.getState())));
          
          chain.reduceRight(
            (next, getRoutes) => routes => getRoutes(moreRoutes => next([...routes, ...moreRoutes])),
            routes => cb(routes.map(decorateTree))
          )([/* init routes */]);
        }
      }
      if (children) {
        const newChildren = React.Children.map(children, child => child && decorateTree(child));
        if (children !== newChildren) newProps.children = newChildren;
      }
      if (_.size(newProps)) return React.cloneElement(element, newProps);
    }
    return element;
  }
}
