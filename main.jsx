'use strict';

import FastClick from 'fastclick';
import React from 'react/addons';
import Router from 'react-router';
import { Redirect, RouteHandler } from 'react-router';

import Canvas from './plot/Canvas';

import PlotTest from './PlotTest';
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

class ChartBlockHandler extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'Financial > GOOG',
      value: 500.0, 
      units: 'dollars', 
      min: 0, 
      max: 1000000.0, 
      precision: 2, 
      color: 'blue',
      alarmState: 'alarm',
    };
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