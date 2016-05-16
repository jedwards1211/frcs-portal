import React, {Component, PropTypes} from 'react'
import {shouldComponentUpdate as shouldPureComponentUpdate} from 'react-addons-pure-render-mixin'
import {Link, match} from 'react-router'
import classNames from 'classnames'

import Glyphicon from '../bootstrap/Glyphicon.jsx'
import {Nav} from './View.jsx'
import PageSlider from './PageSlider'

import splitPrefixes from '../utils/splitPrefixes'
import {createSkinDecorator} from 'react-skin'

import './DrilldownRoute.sass'

const TitleDecorator = createSkinDecorator({
  Title: (Title, props, decorator) => {
    const {children} = props
    const {to} = decorator.props

    return (
      <Title {...props}>
        {to &&
          <Nav left>
            <Link to={to}><Glyphicon menuLeft /></Link>
          </Nav>
        }
        {children}
      </Title>
    )
  }
})

/**
 * Transforms a react-router Route and its subroutes into a drilldown.
 *
 * For instance, for location "/a/b/c", it renders the components for "/a", "/a/b",
 * and "/a/b/c" side by side, and if the location changes, it animates the transition
 * with a horizontal slide effect.
 *
 * Subroutes that don't have a component will not be rendered by DrilldownRoute.
 *
 * It also injects a link to the parent route (or ancestor route that has a component)
 * into the Header of each route that renders one.
 *
 * If you don't want your drilldown views to be rendered as nested components of each
 * other (the usual case), you will need to use index routes, like so:
 * ```
 * <Route path="a" component={DrilldownRoute}>
 *   <IndexRoute component={A} />
 *   <Route path="b">
 *     <IndexRoute component={B} />
 *     <Route path="c" component={C} />
 *   </Route>
 * </Route>
 * ```
 * In this case, for location "a/b/c", DrilldownRoute will render these children:
 * - <A />
 * - <B />
 * - <C />
 *
 * If instead you avoid using index routes...
 * ```
 * <Route component={DrilldownRoute}>
 *   <Route path="a" component={A}>
 *     <Route path="b" component={B}>
 *       <Route path="c" component={C} />
 *     </Route>
 *   </Route>
 * </Route>
 * ```
 * ...then DrilldownRoute will render these children:
 * - <A />
 * - <A><B /></A>
 * - <A><B><C /></B></A>
 */
export default class DrilldownRoute extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
    createRouteElement: PropTypes.func,
  };

  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    routes: PropTypes.array.isRequired
  };

  state = {
    activeIndex: 0,
    routeComponents: []
  };

  // (unmount the child routes that animated out to the right)
  onTransitionEnd = () => this.updateRouteComponents();

  updateRouteComponents = (props = this.props) => {
    const {history, location, route, routes} = props
    const {pathname} = location
    const {router} = this.context
    const createElement = this.context.createRouteElement || React.createElement

    const routeIndex = routes.indexOf(route)
    const drilldownPath = routes.slice(0, routeIndex + 1).join('/')

    const routeComponents = []
    let activeIndex = -1

    // find all components that need to be rendered for all subroutes of this DrilldownRoute
    ;[...splitPrefixes(pathname, '/')].reduceRight(
      // use match from react-router to figure out what components should be rendered for this
      // prefix of the pathname
      (next, prefix) => (error, parentPathnames) => {
        if (error) return next(error)

        match({routes, location: {pathname: prefix}, router}, (error, redirectLocation, renderProps) => {
          if (redirectLocation != null || renderProps == null) return next(null, parentPathnames)

          const {components, location, params, router, routes} = renderProps

          const routePath = routes.slice(0, routeIndex + 1).join('/')
          // ignore the route for this prefix if not a descendant of this DrilldownRoute
          if (routePath !== drilldownPath || components[components.length - 1] == null) {
            return next(null, parentPathnames)
          }

          if (pathname === prefix) activeIndex = routeComponents.length

          const parentPathname = parentPathnames[parentPathnames.length - 1]
          const _createElement = parentPathname
            ? (component, props) => <TitleDecorator to={parentPathname}
                children={createElement(component, props)}
                                    />
            : createElement

          // create the (potentially nested) component for the route for this prefix
          routeComponents.push(React.cloneElement(
            components
              .slice(routeIndex + 1, components.length - 1)
              .reduceRight(
                (children, Comp, index) => (
                  Comp
                    ? _createElement(Comp, {
                    children, location, history, params, router, routes,
                    parentPathnames,
                    route: routes[routeIndex + 1 + index]
                  })
                    : children
                ),
                _createElement(components[components.length - 1], {
                  location, history, params, router, routes,
                  parentPathnames,
                  route: routes[routes.length - 1]
                })
              ),
            {
              key: prefix
            }
          ))

          next(null, [...parentPathnames, prefix])
        })
      },
      (error, parentPathnames) => {
        if (!error) this.setState({routeComponents, activeIndex, parentPathnames})
      }
    )(null, [])
  };

  componentWillMount() {
    this.updateRouteComponents()
  }

  shouldComponentUpdate = shouldPureComponentUpdate;

  componentWillReceiveProps(nextProps) {
    // only update components if the path changed and it's not an ancestor of the current path
    // (because in that case we want the components that are animating out to stay mounted until
    // the transition ends)
    // or update the components if there are new routes on same level/deeper; this supports dynamic routing
    if (!this.props.location.pathname.startsWith(nextProps.location.pathname) ||
      (nextProps.location.pathname.startsWith(this.props.location.pathname) &&
        this.props.routes !== nextProps.routes)) {
      this.updateRouteComponents(nextProps)
    }
    else if (this.props.location.pathname !== nextProps.location.pathname) {
      // otherwise just update activeIndex
      const activeIndex = this.state.parentPathnames.indexOf(nextProps.location.pathname)
      if (activeIndex >= 0) this.setState({activeIndex})
    }
  }

  render() {
    const className = classNames(this.props.className, 'mf-drilldown-route')
    const {activeIndex, routeComponents} = this.state

    return (
      <PageSlider activeIndex={activeIndex} onTransitionEnd={this.onTransitionEnd} className={className}>
        {routeComponents}
      </PageSlider>
    )
  }
}
