'use strict';

import React from 'react';
import classNames from 'classnames';
import BarFill from './BarFill';
import BarAlarmLegend from './BarAlarmLegend';
import GaugePropTypes from './GaugePropTypes';
import layoutSvgText from './layoutSvgText';
import {pickFontSize} from './gaugeUtils';
import FontMetricsCache from '../utils/FontMetricsCache';
import dummyCanvas from '../utils/dummyCanvas';
import {Side, leftSide, bottomSide, xAxis} from '../utils/orient';

require('./VBarGauge.sass');

var LEGEND_WIDTH = 0.04;
var VALUE_WIDTH = 0.6;

var MIN_RANGE_FONT_SIZE = 15;
var MAX_RANGE_FONT_SIZE = 30;

var MIN_NAME_WIDTH = 200;

var ALT_MIN_FONT_SIZE = 15;

function createRect() {
  return {x: 0, y: 0, width: 0, height: 0};
}

export default React.createClass({
  propTypes: Object.assign({}, GaugePropTypes, {
    width:        React.PropTypes.number,
    height:       React.PropTypes.number,
    barSide:      React.PropTypes.instanceOf(Side).isRequired,
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
      var {fontFamily, fontWeight} = window.getComputedStyle(gauge);
      if (this.refs.name) {
        var {fontWeight: nameFontWeight} = window.getComputedStyle(this.refs.name);
      }
      return {
        fontFamily,
        fontWeight,
        nameFontWeight,
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
        size.height !== this.state.height ||
        size.nameFontWeight !== this.state.nameFontWeight) {
      this.setState(size);
    }
  },
  render() {
    var {name, units, min, max, precision, alarms, value, className, alarmState,
        children, width, height, barSide, ...restProps} = this.props;
    var {fontFamily = 'sans-serif', fontWeight = '', nameFontWeight = 'bold'} = this.state;
    if (!width ) width  = this.state.width;
    if (!height) height = this.state.height;
    var fontSize = 20;
    var font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    var fontMetrics = FontMetricsCache.getFontMetrics(font);
    var isNA = isNaN(value) || value === null;

    className = classNames(className, 'gauge vbar-gauge', {
      'gauge-alarm':    alarmState === 'alarm',
      'gauge-warning':  alarmState === 'warning',
      'gauge-na': isNA,
    });

    //height = Math.min(height, 100);
    var padding = Math.min(10, width * 0.05, height * 0.1);
    height -= padding * 2;
    width  -= padding * 2;

    // the following also tolerates undefined values
    if (!(width > 0) || !(height > 0)) {
      return <div ref={c => this.root = c} className={className} {...restProps} />;
    }

    var gaugeRect = createRect();
    gaugeRect.x = gaugeRect.y = 0;
    gaugeRect.width = width;
    gaugeRect.height = height;

    var hasAlarms = alarms && alarms.length;

    function formatValue(value) {
      value = Number(value);
      return isNaN(value) || value === null ? 'NA' : value.toFixed(precision);
    }


    var makeStyle = (text, rect) => {
      var ctx = dummyCanvas.getContext('2d');
      ctx.font = font;
      return {
        fontSize: pickFontSize(fontSize * Math.min(rect.height / fontMetrics.hangingBaseline, rect.width / ctx.measureText(text).width))
      };
    };

    var minText     = formatValue(min);
    var maxText     = formatValue(max);
    var valueText   = formatValue(value);
    var unitsText   = units || '';
    var nameText    = name  || '';

    var ctx = dummyCanvas.getContext('2d');
    ctx.font = `${fontWeight} ${MIN_RANGE_FONT_SIZE}px ${fontFamily}`;
    var minRangeWidth = Math.max(ctx.measureText(minText).width, ctx.measureText(maxText).width);
    ctx.font = `${fontWeight} ${MAX_RANGE_FONT_SIZE}px ${fontFamily}`;
    var maxRangeWidth = Math.max(ctx.measureText(maxText).width, ctx.measureText(maxText).width);

    var barRect = createRect();
    var legendRect = createRect();
    var nameRect = createRect();
    var valueRect = createRect();
    var unitsRect = createRect();
    var rangeRect = createRect();

    if (hasAlarms) {
      legendRect.width = Math.max(2, Math.round(height * LEGEND_WIDTH));
    }

    if (barSide.axis === xAxis) {
      barRect.y = 0;
      barRect.height = height;
      barRect.width = Math.max(minRangeWidth,
        Math.min(maxRangeWidth, width - MIN_NAME_WIDTH - LEGEND_WIDTH - padding));
      barSide.setInRect(barRect, barSide.getFromRect(gaugeRect));

      nameRect.x = barSide === leftSide ? barRect.x + barRect.width + legendRect.width + padding : 0;
      nameRect.width = width - barRect.width - legendRect.width - padding;
      nameRect.height = (height - padding) * 0.5;
      nameRect.y = 0;

      valueRect.y = unitsRect.y = nameRect.y + nameRect.height + padding;
      valueRect.height = unitsRect.height = height - nameRect.height - padding;
      valueRect.width = nameRect.width * VALUE_WIDTH;
      valueRect.x = nameRect.x;
      unitsRect.x = valueRect.x + valueRect.width + padding;
      unitsRect.width = nameRect.width - valueRect.width - padding;
      unitsRect.textX = unitsRect.x;
    }
    else {
      barRect.x = 0;
      barRect.width = width;
      // TODO (I'll implement this layout if we end up using it)
    }

    var legend;
    if (hasAlarms) {
      legendRect.x = barSide === leftSide ? barRect.x + barRect.width : barRect.x - legendRect.width;
      legend = <BarAlarmLegend min={min} max={max} alarms={alarms} minSide={bottomSide}
                x={legendRect.x} y={barRect.y} width={legendRect.width} height={barRect.height} />;
    }

    var rangePadding = Math.min(padding, barRect.width * 0.1);
    rangeRect.height = (barRect.height - rangePadding) * 0.4;
    rangeRect.width = barRect.width - rangePadding * 2;

    let lines = layoutSvgText(nameText, {
      maxWidth: nameRect.width,
      maxHeight: nameRect.height,
      fontFamily,
      fontWeight: nameFontWeight,
      x: nameRect.x,
      y: nameRect.y,
      ascend: false,
    });

    let valueStyle = makeStyle(valueText, valueRect);
    let unitsStyle = makeStyle(unitsText, unitsRect);

    unitsStyle.fontSize = Math.min(unitsStyle.fontSize, lines.fontSize, valueStyle.fontSize);

    if (unitsStyle.fontSize < ALT_MIN_FONT_SIZE) {
      let altValueRect = createRect();
      let altUnitsRect = createRect();
      altValueRect.width = altUnitsRect.width = nameRect.width;
      altValueRect.height = valueRect.height * VALUE_WIDTH;
      altUnitsRect.height = valueRect.height - altValueRect.height - padding;
      altValueRect.x = altUnitsRect.x = valueRect.x;
      altValueRect.y = valueRect.y;
      altUnitsRect.y = valueRect.y + valueRect.height - altUnitsRect.height;
      altUnitsRect.textX = altUnitsRect.x + altUnitsRect.width;

      let altValueStyle = makeStyle(valueText, altValueRect);
      let altUnitsStyle = makeStyle(unitsText, altUnitsRect);

      altUnitsStyle.fontSize = Math.min(altUnitsStyle.fontSize, lines.fontSize, altValueStyle.fontSize);

      if (altUnitsStyle.fontSize > unitsStyle.fontSize && altValueStyle.fontSize > valueStyle.fontSize) {
        className += ' alt-layout';
        valueRect = altValueRect;
        unitsRect = altUnitsRect;
        valueStyle = altValueStyle;
        unitsStyle = altUnitsStyle;
      }
    }

    let minStyle = makeStyle(minText, rangeRect);
    let maxStyle = makeStyle(maxText, rangeRect);

    minStyle.fontSize = maxStyle.fontSize = Math.min(minStyle.fontSize, maxStyle.fontSize);

    return (
      <div ref={c => this.root = c} className={className} {...restProps}>
        <svg key="svg" ref="svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{
          padding: padding
        }}>
          <rect key="track" className="track" {...barRect}/>
          <BarFill  key="fill"
                    className={classNames('fill', {'na': isNA})}
                    {...barRect}
                    min={min}
                    max={max}
                    minSide={bottomSide}
                    value={value} />
          {legend}

          <text key="min"   ref="min"   className="min"   x={barRect.x + barRect.width - rangePadding} y={barRect.y + barRect.height - rangePadding} style={minStyle}>
            {minText}
          </text>
          <text key="max"   ref="max"   className="max"   x={barRect.x + barRect.width - rangePadding} y={barRect.y + rangePadding} style={maxStyle}>
            {maxText}
          </text>
          <text key="value" ref="value" className="value" x={valueRect.x + valueRect.width} y={valueRect.y + valueRect.height} style={valueStyle}>
            {valueText}
          </text>
          <text key="units" ref="units" className="units" x={unitsRect.textX} y={unitsRect.y + unitsRect.height} style={unitsStyle}>
            {unitsText}
          </text>
          <g className="name" ref="name">
            {lines}
          </g>
        </svg>
        {children}
      </div>
    );
  }
});