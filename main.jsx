'use strict';

import FastClick from 'fastclick';
import React from 'react/addons';
import Router from 'react-router';
import { Redirect, RouteHandler } from 'react-router';
var ReactTransitionGroup = React.addons.TransitionGroup;
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

import PlotTest from './PlotTest';

React.initializeTouchEvents(true);

window.addEventListener('load', () => {
  FastClick.attach(document.body);
});

var { Route, DefaultRoute } = Router;

var DefaultRouteHandler = React.createClass({
  render() {
    return <h1>Test!</h1>;
  }
});

var PlotTestHandler = React.createClass({
  render() {
    return <PlotTest/>;
  }
});

var Routes = (
  <Route name="/">
    <DefaultRoute handler={DefaultRouteHandler}/>
    <Route name="plot-test" handler={PlotTestHandler}/>
  </Route>
);

Router.run(Routes, Handler => React.render(<Handler/>, document.getElementById('content')));