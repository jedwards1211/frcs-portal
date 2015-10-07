'use strict';

import React from 'react';
import classNames from 'classnames';
import HBarFill from './HBarFill';
import HBarAlarmLegend from './HBarAlarmLegend';
import GaugePropTypes from './GaugePropTypes';
import _ from 'lodash';

require('./HBarGauge.sass');

var NAME_HEIGHT = 0.6;
var BAR_HEIGHT = 1 - NAME_HEIGHT;
var LEGEND_HEIGHT = 0.04;
var VALUE_WIDTH = 0.4;
var UNITS_WIDTH = 0.15;
var NAME_WIDTH = 0.45;

export default React.createClass({
  propTypes: Object.assign({}, GaugePropTypes, {
    width:        React.PropTypes.number,
    height:       React.PropTypes.number,
  }),
  getInitialState() {
    return {
      width: 0,
      height: 0,
    };
  },
  getCurrentSize() {
    if (this.isMounted()) {
      var gauge = React.findDOMNode(this.refs.gauge);
      return {
        width: gauge.offsetWidth,
        height: gauge.offsetHeight,
      };
    }
    return {
      width: 0,
      height: 0,
    };
  },
  componentDidMount() {
    this.setState(this.getCurrentSize());
  },
  componentWillUpdate(nextProps, nextState) {
    var size = this.getCurrentSize();
    if (size.width  !== this.state.width ||
        size.height !== this.state.height) {
      this.setState(size);
    }
  },
  render() {
    var {name, units, min, max precision, alarms, value, className, alarmState, 
        children, width, height, ...restProps} = this.props;
    if (!width ) width  = this.state.width;
    if (!height) height = this.state.height;

    className = classNames(className, 'gauge hbar-gauge', {
      'gauge-alarm':    alarmState === 'alarm',
      'gauge-warning':  alarmState === 'warning',
    });

    height = Math.min(height, 100);
    var padding = Math.min(10, width * 0.05, height * 0.1);
    height -= padding * 2;
    width  -= padding * 2;

    // the following also tolerates undefined values
    if (!(width > 0) || !(height > 0)) {
      return <div ref="gauge" className={className} {...restProps} />;
    }

    var hasAlarms = alarms && alarms.length;

    function formatValue(value) {
      value = Number(value);
      return !isNaN(value) && value !== null ? value.toFixed(precision) : 'NA';
    }

    // height / width
    var fontAspect = 1.6;

    var makeStyle = (textLength, maxWidth, maxHeight) => ({
      fontSize: Math.max(10, Math.min(maxHeight, maxWidth / textLength * fontAspect))
    });

    var minText     = formatValue(min);
    var maxText     = formatValue(max);
    var valueText   = formatValue(value);
    var unitsText   = units || '';
    var nameText    = name  || '';
    var valueTextLength = Math.max(valueText.length, minText.length, maxText.length);

    var rangeTextLength = Math.max(minText.length, maxText.length);

    var barHeight = Math.round(height * BAR_HEIGHT);
    var barY = Math.round(height - barHeight);
    var legend, legendY, legendHeight;
    if (hasAlarms) {
      legendHeight = Math.max(2, Math.round(height * LEGEND_HEIGHT));
      barHeight -= legendHeight;
      legendY = barY + barHeight;
      legend = <HBarAlarmLegend min={min} max={max} alarms={alarms} 
                x={0} y={legendY} width={width} height={legendHeight} />;
    }

    var nameY = barY - padding;
    var nameHeight = height * NAME_HEIGHT - padding;
    var nameWidth = width * NAME_WIDTH;
    var valueWidth = width * VALUE_WIDTH;
    var unitsWidth = width * UNITS_WIDTH;
    var rangeHeight = barHeight - padding;
    var rangePadding = Math.min(padding, barHeight * 0.1);
    var rangeHeight = barHeight - rangePadding * 2;
    var rangeWidth = (width - padding) * 0.5;

    var rangeY = barY + barHeight / 2;

    return (
      <div ref="gauge" className={className} {...restProps}>
        <svg key="svg" ref="svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{
          padding: padding
        }}>
          <rect key="track" className="track" x={0} y={barY} width={width} height={barHeight} />
          <HBarFill  key="fill"
                    className={classNames('fill', {'na': isNaN(value) || value === null})}
                    x={0} y={barY} width={width} height={barHeight}
                    min={min}
                    max={max}
                    value={value} />
          {legend}

          <text key="min"   ref="min"   className="min"   x={rangePadding}       y={rangeY} style={makeStyle(rangeTextLength, rangeWidth, rangeHeight)}>
            {minText}
          </text>
          <text key="max"   ref="max"   className="max"   x={width - rangePadding} y={rangeY} style={makeStyle(rangeTextLength, rangeWidth, rangeHeight)}>
            {maxText}
          </text>
          <text key="value" ref="value" className="value" x={width - unitsWidth - padding} y={nameY} style={makeStyle(valueTextLength, valueWidth - padding, nameHeight)}>
            {valueText}
          </text>
          <text key="units" ref="units" className="units" x={width - unitsWidth} y={nameY} style={makeStyle(unitsText.length, unitsWidth - padding, nameHeight)}> 
            {unitsText}
          </text>
          <text key="name"  ref="name"  className="name"  x={0}                  y={nameY} style={makeStyle(nameText.length , nameWidth - padding, nameHeight)}>
            {nameText}
          </text>
        </svg>
        {children}
      </div>
    );
  }
});