'use strict';

import React from 'react';
import classNames from 'classnames';
import FittedText from './FittedText';
import ArcFill from './ArcFill';
import ArcAlarmLegend from './ArcAlarmLegend';
import arcPath from '../arcPath';
import _ from 'lodash';
import * as GaugePropTypes from './GaugePropTypes';

require('./ArcGauge.sass');

var PADDING    = 5;
var ARC_WIDTH  = 300;
var ARC_HEIGHT = ARC_WIDTH / 2;
var ARC_THICKNESS = 25;
var ARC_CENTER = [ARC_WIDTH / 2, ARC_HEIGHT];
var ARC_RADIUS = [ARC_WIDTH / 2, ARC_HEIGHT];
var LEGEND_RADIUS = [ARC_RADIUS[0] - ARC_THICKNESS, ARC_RADIUS[1] - ARC_THICKNESS];
var LEGEND_THICKNESS = 4;
var VALUE_HEIGHT = ARC_HEIGHT * 0.45;
var UNITS_HEIGHT = ARC_HEIGHT * 0.15;
var NAME_HEIGHT  = ARC_HEIGHT * 0.2;
var RANGE_HEIGHT = ARC_HEIGHT * 0.15;
var VALUE_WIDTH  = ARC_WIDTH  * 0.8;
var NAME_WIDTH   = ARC_WIDTH * 0.4;
var RANGE_WIDTH  = (ARC_WIDTH - NAME_WIDTH - PADDING * 2) / 2;
var UNITS_WIDTH  = 2 * Math.sqrt(Math.pow(ARC_HEIGHT - ARC_THICKNESS, 2) - Math.pow(VALUE_HEIGHT + PADDING + UNITS_HEIGHT, 2));

var TRACK_PATH = arcPath(ARC_CENTER, ARC_RADIUS, ARC_THICKNESS, Math.PI, -Math.PI);

export default React.createClass({
  propTypes: GaugePropTypes,
  render() {
    var {name, units, min, max, precision, alarms, value, 
        className, alarmState, children, ...restProps} = this.props;

    className = classNames(className, 'gauge arc-gauge', {
      'alarm-triggered': alarmState && alarmState.severity === 'alarm',
      'warning-triggered': alarmState && alarmState.severity === 'warning',
    });

    function formatValue(value) {
      value = Number(value);
      return !isNaN(value) && value !== null ? value.toFixed(precision) : 'NA';
    }

    // height / width
    var fontAspect = 1.6;

    var makeStyle = (textLength, maxWidth, maxHeight) => ({
      fontSize: Math.min(maxHeight, maxWidth / textLength * fontAspect)
    });

    var minText     = formatValue(min);
    var maxText     = formatValue(max);
    var unitsText   = units || '';
    var nameText    = name  || '';
    var valueText   = formatValue(value);

    var rangeTextLength = Math.max(minText.length, maxText.length);

    return (
      <div ref="root" className={className} {...restProps}>
        <svg key="svg" ref="svg" viewBox={'0 0 ' + ARC_WIDTH + ' ' + (ARC_HEIGHT + NAME_HEIGHT + PADDING)} preserveAspectRatio="xMidYMid meet">
          <path key="track" className="track" d={TRACK_PATH} />
          <ArcFill  key="fill"
                    className={classNames('fill', {'na': isNaN(value) || value === null})}
                    center={ARC_CENTER} 
                    radius={ARC_RADIUS} 
                    minAngle={Math.PI} 
                    angularSpan={-Math.PI}
                    thickness={ARC_THICKNESS}
                    min={min}
                    max={max}
                    value={value} />

          <ArcAlarmLegend key="legend"
                          center={ARC_CENTER}
                          radius={LEGEND_RADIUS}
                          thickness={LEGEND_THICKNESS}
                          minAngle={Math.PI}
                          angularSpan={-Math.PI}
                          min={min}
                          max={max}
                          alarms={alarms} />

          <text key="min"   ref="min"   className="min"   x={0}             y={ARC_HEIGHT + PADDING} style={makeStyle(rangeTextLength, RANGE_WIDTH, RANGE_HEIGHT)}>
            {minText}
          </text>
          <text key="max"   ref="max"   className="max"   x={ARC_WIDTH}     y={ARC_HEIGHT + PADDING} style={makeStyle(rangeTextLength, RANGE_WIDTH, RANGE_HEIGHT)}>
            {maxText}
          </text>
          <text key="value" ref="value" className="value" x={ARC_WIDTH / 2} y={ARC_HEIGHT} style={makeStyle(valueText.length, VALUE_WIDTH, VALUE_HEIGHT)}>
            {valueText}
          </text>
          <text key="units" ref="units" className="units" x={ARC_WIDTH / 2} y={ARC_HEIGHT - VALUE_HEIGHT - PADDING} style={makeStyle(unitsText.length, UNITS_WIDTH, UNITS_HEIGHT)}>
            {unitsText}
          </text>
          <text key="name"  ref="name"  className="name"  x={ARC_WIDTH / 2} y={ARC_HEIGHT + PADDING} style={makeStyle(nameText.length, NAME_WIDTH, NAME_HEIGHT)}>
            {nameText}
          </text>
        </svg>
        {children}
      </div>
    );
  }
});