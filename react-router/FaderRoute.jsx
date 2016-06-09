/* @flow */

import React, {Component} from 'react'

import Fader from '../common/Fader.jsx'

type Props = {
  children: any,
  route: Object,
  routes: Object[]
}

let nextRouteKey = 0

export default class FaderRoute extends Component<void, Props, void> {
  routeKeys: Map<Object, number> = new Map();
  prevRoute: ?Object;

  render() {
    let {children, route, routes} = this.props

    const routeIndex = routes.indexOf(route)
    const nextRoute = routes[routeIndex + 1]

    let routeKey
    if (nextRoute) {
      const {routeKeys, prevRoute} = this
      routeKey = routeKeys.get(nextRoute)
      if (routeKey == null) {
        if (prevRoute && prevRoute.component === nextRoute.component &&
          prevRoute.path === nextRoute.path) {
          routeKey = routeKeys.get(prevRoute)
        }
        else {
          routeKey = nextRouteKey++
        }
        routeKeys.set(nextRoute, routeKey)
      }

    }
    this.prevRoute = nextRoute

    return <Fader>
      <div key={routeKey}>{children}</div>
    </Fader>
  }
}
