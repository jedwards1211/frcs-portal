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

import './PlotTest.sass';

export default React.createClass({
  getInitialState() {
    return {
      timeConversion: new andyplot.LinearConversion(0, 0, 3600000, 1000),
      valueConversion: new andyplot.LinearConversion(1, 0, -1, 200),
    };
  },
  onPlotResize(newSize) {
    this.setState({plotSize: newSize});
  },
  onMove(newXConversion, newYConversion) {
    this.setState({
      timeConversion:  newXConversion || this.state.timeConversion,
      valueConversion: newYConversion || this.state.valueConversion,
    });
  },
  render() {
    var {plotSize, timeConversion, valueConversion} = this.state;

    var resolution = 1000;

    var dataSource = {
      get(from, to, surround, callback) {
        var t = surround ? andyplot.modLower(from, resolution) :
                            andyplot.modCeiling(from, resolution);

        while (surround ? t <= to : t < to) {
          callback(t, Math.sin(t * Math.PI * 2 / 500000));
          t += resolution;
        }
      },
    };

    var plotLayers = [];
    var timeAxisLayers = [];
    var valueAxisLayers = [];

    if (plotSize && plotSize.width > 1 && plotSize.height > 1) {
      var timeMetrics = new TimeMetrics(timeConversion, 0, plotSize.width - 1, {
        minMajorSpacing: Math.min(80, plotSize.width / 2),
        minMinorSpacing: Math.min(20, plotSize.width / 2),
      });
      var valueMetrics = new ValueMetrics(valueConversion, 0, plotSize.height - 1, {
        minMajorSpacing: 30,
        minMinorSpacing: 15,
      });

      plotLayers = [
        new CanvasClearer(),
        new GridLines(timeMetrics, xAxis),
        new Trace({
          dataSource,
          lineColor: '#00f',
          fillColor: 'rgba(0,0,255,0.5)',
          domainConversion: timeConversion, 
          valueConversion, 
          plotter: andyplot.AutoFatTracePlotter,
        }),
      ];

      timeAxisLayers = [
        new CanvasClearer(),
        new GridAxis(timeMetrics, topSide),
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