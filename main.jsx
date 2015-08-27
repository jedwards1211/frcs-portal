'use strict';

import FastClick from 'fastclick';
import React from 'react/addons';
import Router from 'react-router';
import { Redirect, RouteHandler } from 'react-router';

import Canvas from './plot/Canvas';

import PlotTest from './PlotTest';
import FittedText from './FittedText';
import ChartBlock from './blocks/ChartBlock';

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

class FittedTextHandler extends React.Component {
  render() {
    return <FittedText style={{width: '100%', height: '100%', border: '1px solid black'}}>This is a test</FittedText>;
  }
}

class ChartBlockHandler extends React.Component {
  constructor(props) {
    super(props);
    this.state = {min: 0, max: 1000000.0, value: 500.0, units: 'dollars', precision: 2, name: 'Financial > GOOG'};
  }
  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState({value: Math.random() * this.state.max});
    }, 1000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  render() {
    return <ChartBlock {...this.state} style={{width: '100%', height: '100%'}}/>;
  }
}

var Routes = (
  <Route name="/">
    <DefaultRoute handler={PlotTest}/>
    <Route name="ChartBlock" handler={ChartBlockHandler}/>
  </Route>
);

Router.run(Routes, Handler => React.render(<Handler/>, document.getElementById('content')));