'use strict';

import FastClick from 'fastclick';
import React from 'react/addons';
import Router from 'react-router';
import { Redirect, RouteHandler } from 'react-router';

import Canvas from './plot/Canvas';

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

var Routes = (
  <Route name="/">
    <DefaultRoute handler={PlotTest}/>
  </Route>
);

Router.run(Routes, Handler => React.render(<Handler/>, document.getElementById('content')));