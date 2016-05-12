import React from 'react'
import {Route} from 'react-router'

import pluginRouteSupport from '../../pluginRouteSupport.jsx'

describe('pluginRouteSupport', () => {
  it('creates getChildRoutes for getChildRoutesFromStore', () => {
    const store = {}
    const spy = jasmine.createSpy('getChildRoutesFromStore')
    const route = pluginRouteSupport(store)(<Route getChildRoutesFromStore={spy} />)
    const location = {}
    const cb = () => {}
    route.props.getChildRoutes(location, cb)
    expect(spy).toHaveBeenCalled()
  })
  it('creates getChildRoutes for getChildRoutesFromStore', () => {
    const store = {}
    const helloRoute = <Route path="hello" />
    const worldRoute = <Route path="world" />
    const props = {
      getChildRoutes: (location, cb) => cb([helloRoute]),
      getChildRoutesFromStore: (location, store, cb) => cb([worldRoute])
    }
    spyOn(props, 'getChildRoutes').and.callThrough()
    spyOn(props, 'getChildRoutesFromStore').and.callThrough()
    const route = pluginRouteSupport(store)(<Route {...props} />)
    const location = {}
    const cb = jasmine.createSpy('cb')
    route.props.getChildRoutes(location, cb)
    expect(props.getChildRoutes).toHaveBeenCalled()
    expect(props.getChildRoutesFromStore).toHaveBeenCalled()
    expect(cb.calls.count()).toBe(1)
    expect(cb.calls.argsFor(0)).toEqual([[
      pluginRouteSupport(store)(helloRoute),
      pluginRouteSupport(store)(worldRoute)
    ]])
  })
  it('creates getChildRoutes for getChildRoutesFromStore even on child routes', () => {
    const store = {}
    const spy = jasmine.createSpy('getChildRoutesFromStore')
    const route = pluginRouteSupport(store)(
      <Route>
        <Route getChildRoutesFromStore={spy} />
      </Route>
    )
    const location = {}
    const cb = () => {}
    route.props.children[0].props.getChildRoutes(location, cb)
    expect(spy).toHaveBeenCalled()
  })
})
