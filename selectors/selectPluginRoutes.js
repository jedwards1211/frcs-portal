/* @flow */

import React from 'react';
import _ from 'lodash';
import {createSelector} from 'reselect';

const selectPluginRoutes: (routeKey: string) => (state: any) => React.Element[] = _.memoize(
  routeKey => createSelector(
    state => state.get('plugins'),
    plugins => {
      let routes = [];
      plugins.forEach(plugin => {
        let route = plugin.getIn(['routes', routeKey]);
        if (route) routes.push(React.cloneElement(route, {key: plugin.get('key')}));
      });
      return routes;
    }
  )
);

export default selectPluginRoutes;
