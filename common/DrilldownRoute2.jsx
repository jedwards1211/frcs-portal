import Promise from 'bluebird';
import React, {Component, PropTypes} from 'react';
import {shouldComponentUpdate as shouldPureComponentUpdate} from 'react-addons-pure-render-mixin';
import {Link, match as unpromisifiedMatch} from 'react-router';
import classNames from 'classnames';

import Glyphicon from '../bootstrap/Glyphicon.jsx';
import {Nav} from './View.jsx';
import PageSlider from './PageSlider';

import splitPrefixes from '../utils/splitPrefixes';
import {createSkinDecorator} from 'react-skin';

import './DrilldownRoute.sass';

const match = Promise.promisify(unpromisifiedMatch, {multiArgs: true});

const TitleDecorator = createSkinDecorator({
  Title: (Title, props, decorator) => {
    let {children} = props;
    let {to} = decorator.props;

    return <Title {...props}>
      {to && <Nav left>
        <Link to={to}><Glyphicon menuLeft/></Link>
      </Nav>}
      {children}
    </Title>;
  }
});

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
 * <Route path="a">
 *   <IndexRoute component={A} />
 *   <Route path="b">
 *     <IndexRoute component={B} />
 *     <Route path="c" component={C} />
 *   </Route>
 * </Route>
 * ```
 * In this case, for location "/a/b/c", DrilldownRoute will render these children:
 * - <A />
 * - <B />
 * - <C />
 * 
 * If instead you avoid using index routes...
 * ```
 * <Route path="a" component={A}>
 *   <Route path="b" component={B}>
 *     <Route path="c" component={C} />
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
    router: PropTypes.object.isRequired   
  };
  
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    routes: PropTypes.array.isRequired
  };

  activeIndex = 0;
  routeComponents = [];
  
  onTransitionEnd = () => {
    // unmount the child routes that animated out to the right
    this.updateRouteComponents();
  };
  
  updateRouteComponents = (props = this.props) => {
    let {history, location, route, routes} = props;
    let {router} = this.context;
    
    let {pathname} = location;
    
    let promises = [];
    let componentMap = {};

    // find all components that need to be rendered for all subroutes of this DrilldownRoute
    for (let prefix of splitPrefixes(pathname, '/')) {
      // use match from react-router to figure out what components should be rendered for this
      // prefix of the pathname
      promises.push(match({routes, location: {pathname: prefix}, router})
        .then(([redirectLocation, renderProps]) => {
          if (renderProps == null) return;
          let {components, location, params, router, routes} = renderProps;
          
          // ignore the route for this prefix if not a descendant of this DrilldownRoute
          const routeIndex = routes.indexOf(route);
          if (routeIndex < 0 || components[components.length - 1] == null) return;

          // create the (potentially nested) for the route for this prefix
          let LastComp = components[components.length - 1];
          componentMap[prefix] = components.slice(routeIndex + 1, components.length - 1).reduceRight(
            (children, Comp, index) => Comp ? <Comp children={children} location={location}
                                                    history={history} params={params} 
                                                    router={router} routes={routes}
                                                    route={routes[routeIndex + 1 + index]}/> : children,
            <LastComp location={location}
                      history={history} params={params}
                      router={router} routes={routes}/>
          );
        }));
    }
    
    // match is async so we have to wait for all of the match calls to finish
    Promise.join(promises).then(() => {
      let routeComponents = [];
      let parentPath;
      for (let prefix of splitPrefixes(pathname, '/')) {
        if (componentMap[prefix]) {
          if (parentPath) {
            // inject a link to parentPath in the Title of this component (if it renders one)
            routeComponents[routeComponents.length] = <TitleDecorator key={prefix} to={parentPath} 
                                                                      location={componentMap[prefix].props.location}>
              {componentMap[prefix]}
            </TitleDecorator>;
          }
          else {
            routeComponents[routeComponents.length] = React.cloneElement(componentMap[prefix], {key: prefix});
          }
          parentPath = prefix;
        }
      }
      this.routeComponents = routeComponents;
      this.forceUpdate();
    });
  };

  componentWillMount() {
    this.updateRouteComponents();
  }
  
  shouldComponentUpdate = shouldPureComponentUpdate;
  
  componentWillReceiveProps(nextProps) {
    // only update components if the path changed and it's not an ancestor of the current path
    // (because in that case we want the components that are animating out to stay mounted until
    // the transition ends)
    if (nextProps.location.pathname !== this.props.location.pathname &&
        !this.props.location.pathname.startsWith(nextProps.location.pathname)) {
      this.updateRouteComponents(nextProps);
    }
  }

  render() {
    let {className, location: {pathname}} = this.props;
    className = classNames(className, 'mf-drilldown-route');
    
    let activeIndex = this.routeComponents.findIndex(comp => comp.props.location.pathname === pathname);
    // stay at the current index if updateRouteComponents is not done with its async work
    if (activeIndex >= 0) {
      this.activeIndex = activeIndex;
    }
    
    return <PageSlider activeIndex={this.activeIndex}
                       onTransitionEnd={this.onTransitionEnd}
                       className={className}>
      {this.routeComponents}
    </PageSlider>;
  }
}
