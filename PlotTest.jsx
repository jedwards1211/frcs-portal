import React from 'react';

import _ from 'lodash';

import LayeredCanvas from './plot/LayeredCanvas';
import CanvasClearer from './plot/CanvasClearer';
import Trace from './plot/Trace';
import GridAxis from './plot/GridAxis';
import GridLines from './plot/GridLines';
import PlotInteractionController from './plot/PlotInteractionController';

import * as andyplot from './plot/andyplot';
import {TimeMetrics, DateMetrics, ValueMetrics} from './plot/GridMetrics';
import {xAxis, yAxis, topSide, bottomSide, leftSide, rightSide} from './orient';

import FakeDataSource from './plot/FakeDataSource2';
import DataCache from './plot/DataCache';

import './PlotTest.sass';

var dataSource = new FakeDataSource();
var dataCache = new DataCache(dataSource, 3600000);

export default React.createClass({
  getInitialState() {
    return {
      timeConversion: new andyplot.LinearConversion(0, 0.5, 3600000, 999.5),
      valueConversion: new andyplot.LinearConversion(3, 0.5, -3, 199.5),
    };
  },
  onPlotResize(newSize) {
    this.setState({plotSize: newSize});
  },
  onMove(newXConversion, newYConversion) {
    if (newXConversion) newXConversion.align(3600000);
    if (newYConversion) newYConversion.align(0.2);
    this.setState({
      timeConversion:  newXConversion || this.state.timeConversion,
      valueConversion: newYConversion || this.state.valueConversion,
    });
  },
  componentDidMount() {
    dataCache.on('dataAdded', this.onDataAdded);
  },
  componentWillUnmount() {
    dataCache.removeListener('dataAdded', this.onDataAdded);
  },
  onDataAdded(details) {
    var {plotSize, timeConversion} = this.state;
    var minTime = timeConversion.invert(0.5);
    var maxTime = timeConversion.invert(plotSize.width - 0.5);
    if (this.isMounted() && details.beginTime < maxTime && details.endTime > minTime) {
      this.forceUpdate();
    }
  },
  render() {
    var {plotSize, timeConversion, valueConversion} = this.state;

    var resolution = 1000;

    var plotLayers = [];
    var timeAxisLayers = [];
    var valueAxisLayers = [];

    if (plotSize && plotSize.width > 1 && plotSize.height > 1) {
      var timeMetrics = new DateMetrics(timeConversion, 0.5, plotSize.width - 0.5, {
        minMajorSpacing: Math.min(80, plotSize.width / 2),
        minMinorSpacing: Math.min(20, plotSize.width / 2),
      });
      var valueMetrics = new ValueMetrics(valueConversion, 0.5, plotSize.height - 0.5, {
        minMajorSpacing: 30,
        minMinorSpacing: 15,
      });

      plotLayers = [
        new CanvasClearer(),
        new GridLines(timeMetrics, xAxis),
        new Trace({
          dataSource: {
            get(...args) {
              return dataCache.get('', ...args);
            }
          },
          lineColor: '#00f',
          fillColor: 'rgba(0,0,255,0.5)',
          domainConversion: timeConversion, 
          valueConversion, 
          plotter: andyplot.AutoFatTracePlotter,
        }),
      ];

      timeAxisLayers = [
        new CanvasClearer(),
        new GridAxis(timeMetrics, topSide, {
          justifyEndLabels: true
        }),
      ];

      valueAxisLayers = [
        new CanvasClearer(),
        new GridAxis(valueMetrics, leftSide),
      ];
    }

    return <PlotInteractionController xConversion={timeConversion} onMove={this.onMove}>
      <div className="plot-test">
        <div className="plot-border">
          <LayeredCanvas className="plot" ref="plot" onResize={this.onPlotResize} layers={plotLayers}/>
        </div>
        <LayeredCanvas className="time-axis" layers={timeAxisLayers}/>
        <LayeredCanvas className="value-axis" layers={valueAxisLayers}/>
      </div>
    </PlotInteractionController>;
  } 
});