/* @flow */

import React from 'react'
import {createSelector} from 'reselect'

export default function selectPluginRoutes(routeKey: string): (state: any) => React.Element[] {
  return createSelector(
    state => state.get('plugins'),
    plugins => {
      let routes = []
      plugins.forEach(plugin => {
        let route = plugin.getIn(['routes', routeKey])
        if (route) routes.push(React.cloneElement(route, {key: plugin.get('key')}))
      })
      return routes
    }
  )
}
