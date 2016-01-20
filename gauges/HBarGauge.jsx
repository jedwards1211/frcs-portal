'use strict';

import React from 'react';
import classNames from 'classnames';
import HBarFill from './HBarFill';
import HBarAlarmLegend from './HBarAlarmLegend';
import GaugePropTypes from './GaugePropTypes';
import layoutSvgText from './layoutSvgText';
import {pickFontSize} from './gaugeUtils';
import FontMetricsCache from '../utils/FontMetricsCache';
import dummyCanvas from '../utils/dummyCanvas';

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
      var gauge = this.root;
      var {fontFamily, fontWeight} = window.getComputedStyle(this.root);
      return {
        fontFamily,
        fontWeight,
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
    var {name, units, min, max, precision, alarms, value, className, alarmState, 
        children, width, height, ...restProps} = this.props;
    var {fontFamily, fontWeight} = this.state;
    if (!width ) width  = this.state.width;
    if (!height) height = this.state.height;
    var fontSize = 20;
    var font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    var fontMetrics = FontMetricsCache.getFontMetrics(font);
    var isNA = isNaN(value) || value === null;

    className = classNames(className, 'gauge hbar-gauge', {
      'gauge-alarm':    alarmState === 'alarm',
      'gauge-warning':  alarmState === 'warning',
      'gauge-na': isNA,
    });

    height = Math.min(height, 100);
    var padding = Math.min(10, width * 0.05, height * 0.1);
    height -= padding * 2;
    width  -= padding * 2;

    // the following also tolerates undefined values
    if (!(width > 0) || !(height > 0)) {
      return <div ref={c => this.root = c} className={className} {...restProps} />;
    }

    var hasAlarms = alarms && alarms.length;

    function formatValue(value) {
      value = Number(value);
      return isNaN(value) || value === null ? 'NA' : value.toFixed(precision);
    }


    var makeStyle = (text, maxWidth, maxHeight) => {
      var ctx = dummyCanvas.getContext('2d');
      ctx.font = font;
      return {
        fontSize: pickFontSize(fontSize * Math.min(maxHeight / fontMetrics.hangingBaseline, maxWidth / ctx.measureText(text).width))
      };
    };

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
    var rangePadding = Math.min(padding, barHeight * 0.1);
    var rangeHeight = barHeight - rangePadding * 2;
    var rangeWidth = (width - padding) * 0.5;

    var rangeY = barY + barHeight / 2;

    let lines = layoutSvgText(nameText, {
      maxWidth: nameWidth,
      maxHeight: nameHeight,
      fontFamily,
      fontWeight: 'bold',
      x: 0,
      y: nameY,
      ascend: true,
      props: {className: 'name'},
    });

    let valueStyle = makeStyle(valueText, valueWidth - padding, nameHeight);
    let unitsStyle = makeStyle(unitsText, unitsWidth, nameHeight);

    unitsStyle.fontSize = Math.min(unitsStyle.fontSize, lines.fontSize, valueStyle.fontSize);

    let minStyle = makeStyle(minText, rangeWidth, rangeHeight);
    let maxStyle = makeStyle(maxText, rangeWidth, rangeHeight);

    minStyle.fontSize = maxStyle.fontSize = Math.min(minStyle.fontSize, maxStyle.fontSize);

    return (
      <div ref={c => this.root = c} className={className} {...restProps}>
        <svg key="svg" ref="svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{
          padding: padding
        }}>
          <rect key="track" className="track" x={0} y={barY} width={width} height={barHeight} />
          <HBarFill  key="fill"
                    className={classNames('fill', {'na': isNA})}
                    x={0} y={barY} width={width} height={barHeight}
                    min={min}
                    max={max}
                    value={value} />
          {legend}

          <text key="min"   ref="min"   className="min"   x={rangePadding}       y={rangeY} style={minStyle}>
            {minText}
          </text>
          <text key="max"   ref="max"   className="max"   x={width - rangePadding} y={rangeY} style={maxStyle}>
            {maxText}
          </text>
          <text key="value" ref="value" className="value" x={width - unitsWidth - padding} y={nameY} style={valueStyle}>
            {valueText}
          </text>
          <text key="units" ref="units" className="units" x={width - unitsWidth} y={nameY} style={unitsStyle}> 
            {unitsText}
          </text>
          {lines}
        </svg>
        {children}
      </div>
    );
  }
});