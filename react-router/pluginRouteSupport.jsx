/* @flow */

import React from 'react';
import {Route} from 'react-router';
import _ from 'lodash';

import selectPluginRoutes from '../selectors/selectPluginRoutes';
import {Store} from '../flowtypes/reduxTypes';

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
