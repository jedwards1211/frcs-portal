import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import Canvas from './plot/Canvas';
import CanvasClearer from './plot/CanvasClearer';
import Trace from './plot/Trace';
import GridAxis from './plot/GridAxis';
import GridLines from './plot/GridLines';
import PlotInteractionController from './plot/PlotInteractionController';

import LinearConversion from './plot/LinearConversion';
import {TimeMetrics, DateMetrics, ValueMetrics} from './plot/GridMetrics';
import {xAxis, yAxis, topSide, bottomSide, leftSide, rightSide} from './orient';

import FakeDataSource from './plot/FakeDataSource2';
import DataCache from './plot/DataCache';

import './PlotTest.sass';

var dataSource = new FakeDataSource();
var dataCache = new DataCache({dataSource, pageRange: 3600000, maxPages: 10});

var traceDataSource = {
  get(...args) {
    return dataCache.get('', ...args);
  }
};

export default class PlotTest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      plotSize: {
        width: 1,
        height: 1,
      },
      axis: xAxis,
      timeConversion: new LinearConversion(0, 0.5, 3600000, 999.5),
      valueConversion: new LinearConversion(3, 0.5, -3, 199.5),
    };
  }
  onPlotResize = (newSize) => {
    this.setState({plotSize: newSize});
  }
  onMove = (newXConversion, newYConversion) => {
    // if (newXConversion) newXConversion.align(3600000);
    // if (newYConversion) newYConversion.align(0.2);
    var {axis, timeConversion, valueConversion} = this.state;
    this.setState({
      timeConversion:  axis.select         (newXConversion, newYConversion) || timeConversion,
      valueConversion: axis.opposite.select(newXConversion, newYConversion) || valueConversion,
    });
  }
  componentDidMount() {
    dataCache.on('dataChange', this.onDataChange);
  }
  componentWillUnmount() {
    dataCache.removeListener('dataChange', this.onDataChange);
  }
  onDataChange = (details) => {
    var {axis, plotSize, timeConversion} = this.state;
    var minTime = timeConversion.invert(0.5);
    var maxTime = timeConversion.invert(plotSize[axis.span] - 0.5);
    if (details.beginTime < maxTime && details.endTime > minTime) {
      this.forceUpdate();
    }
  }
  onToggleAxisClick = () => {
    this.setState({axis: this.state.axis.opposite}, () => {
      var evt = document.createEvent('UIEvents');
      evt.initUIEvent('resize', true, false, window, 0);
      window.dispatchEvent(evt);
    });
  }
  render() {
    var {plotSize, axis, timeConversion, valueConversion} = this.state;

    var resolution = 1000;

    var plotLayers = [];
    var timeAxisLayers = [];
    var valueAxisLayers = [];

    var timeMetrics = new DateMetrics(timeConversion, 0.5, plotSize[axis.span] - 0.5, {
      minMajorSpacing: Math.min(80, plotSize[axis.span] / 2),
      minMinorSpacing: Math.min(20, plotSize[axis.span] / 2),
    });
    var valueMetrics = new ValueMetrics(valueConversion, 0.5, plotSize[axis.opposite.span] - 0.5, {
      minMajorSpacing: 30,
      minMinorSpacing: 15,
    });

    setTimeout(() => dataCache.touch([''], timeMetrics.startValue, timeMetrics.endValue, true), 0);

    var props = {
      [axis.name + 'Conversion']: timeConversion
    };

    var className = classNames('plot-test', axis.name + '-axis');

    return <div className={className}>
      <PlotInteractionController {...props} onMove={this.onMove}> 
        <div> 
          <div className="plot-border">
            <Canvas className="plot" ref="plot" onResize={this.onPlotResize}>
              <CanvasClearer/>
              <GridLines metrics={timeMetrics} axis={axis}/>
              <Trace forEachPoint={(...args) => traceDataSource.get(...args)} 
                domainConversion={timeConversion} valueConversion={valueConversion} 
                domainAxis={axis}/>
            </Canvas>
          </div>
          <Canvas className="time-axis">
            <CanvasClearer/>
            <GridAxis metrics={timeMetrics} tickSide={axis.opposite.minSide} justifyEndLabels={true}/>
          </Canvas>
          <Canvas className="value-axis">
            <CanvasClearer/>
            <GridAxis metrics={valueMetrics} tickSide={axis.minSide}/>
          </Canvas>
        </div>
      </PlotInteractionController>
      <button className="axis-toggle-btn" onClick={this.onToggleAxisClick}>Toggle Axis</button>
    </div>;
  } 
}
