import React from 'react';
import Immutable from 'immutable';
import classNames from 'classnames';
import _ from 'lodash';

import Canvas from './plot/Canvas';
import CanvasClearer from './plot/CanvasClearer';
import Trace from './plot/Trace';
import Plot from './plot/Plot';
import GridAxis from './plot/GridAxis';
import GridLines from './plot/GridLines';
import PlotInteractionController from './plot/PlotInteractionController';

import LinearConversion from './plot/LinearConversion';
import {TimeMetrics, DateMetrics, ValueMetrics} from './plot/GridMetrics';
import {xAxis, yAxis, topSide, bottomSide, leftSide, rightSide} from './orient';

import FakeDataSource from './plot/FakeDataSource2';
import DataCache from './plot/DataCache';

import './PlotTest2.sass';

var dataSource = new FakeDataSource();
var dataCache = new DataCache({dataSource, pageRange: 3600000, maxPages: 100});

export default class PlotTest2 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      plotSize: {
        width: 1,
        height: 1,
      },
      axis: xAxis,
      timeConversion: new LinearConversion(0, 0.5, 3600000, 999.5),
      model: Immutable.fromJS([
        {
          id: 0,
          traces: [
            {
              id: 0,
              min: -3,
              max: 3,
              color: '#f00',
            },
            {
              id: 1,
              min: -3,
              max: 3,
              color: '#00f'
            },
          ],
        },
        {
          id: 1,
          traces: [
            {
              id: 2,
              min: -3,
              max: 3,
              color: '#0d0',
            },
            {
              id: 3,
              min: -3,
              max: 3,
              color: '#bb0'
            },
          ],
        },
      ]),
    };
  }
  onMove = (newXConversion, newYConversion) => {
    var {axis, timeConversion} = this.state;
    this.setState({
      timeConversion: axis.select(newXConversion, newYConversion) || timeConversion,
    });
  }
  onPlotResize = (plotSize) => {
    this.setState({plotSize});
  }
  onToggleAxisClick = () => {
    this.setState({axis: this.state.axis.opposite}, () => {
      var evt = document.createEvent('UIEvents');
      evt.initUIEvent('resize', true, false, window, 0);
      window.dispatchEvent(evt);
    });
  }
  render() {
    var {plotSize, axis, timeConversion, model} = this.state;

    var timeMetrics = new DateMetrics(timeConversion, 0.5, plotSize[axis.span] - 0.5, {
      minMajorSpacing: Math.min(80, plotSize[axis.span] / 2),
      minMinorSpacing: Math.min(20, plotSize[axis.span] / 2),
    });

    var channels = [];

    model.forEach(plot => {
      plot.get('traces').forEach(trace => channels.push(trace.get('id')));
    });

    setTimeout(() => dataCache.touch(channels, timeMetrics.startValue, timeMetrics.endValue, true), 0);

    var plots = [];
    model.forEach(plot => {
      var traces = plot.get('traces');
      plots.push(<Plot key={plot.get('id')}
        domainAxis={axis} 
        domainMetrics={timeMetrics} 
        onMove={this.onMove}
        dataCache={dataCache}
        onResize={!plots.length ? this.onPlotResize : undefined}
        traces={traces}/>);
    });

    var className = classNames('plot-test-2', axis.name + '-axis');

    return <div className={className}>
      <Canvas className="plot time-axis" style={{[axis.span]: plotSize[axis.span]}}>
        <CanvasClearer/>
        <GridAxis metrics={timeMetrics} tickSide={axis.opposite.maxSide} justifyEndLabels={true}/>
      </Canvas>
      {plots}
      <button className="axis-toggle-btn" onClick={this.onToggleAxisClick}>Toggle Axis</button>
    </div>;
  }
}
