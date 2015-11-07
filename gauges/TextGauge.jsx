import React from 'react';
import classNames from 'classnames';

import GaugePropTypes from './GaugePropTypes';
import './TextGauge.sass';
import dummyCanvas from '../utils/dummyCanvas';

let decimalZerosRx = /^([^.]+)\.0+$/;

export default class TextGauge extends React.Component {
  constructor(props) {
    super(props);
    this.state = {width: 0, height: 0};
  }
  static propTypes = Object.assign({}, GaugePropTypes, {
    color:      React.PropTypes.string,
    showRange:  React.PropTypes.bool,
  })
  static defaultProps = {
    className: 'text-gauge',
  }
  resize() {
    var root = this.refs.root;
    var name = this.refs.name;
    var value = this.refs.value;
    var units = this.refs.units;
    var max = this.refs.max;
    var {offsetWidth, offsetHeight} = root;
    var {fontFamily, fontWeight, paddingTop, paddingBottom} = window.getComputedStyle(root);

    var vpadding = (parseFloat(paddingTop) || 0) + (parseFloat(paddingBottom) || 0);

    var width = offsetWidth;
    var height = offsetHeight - vpadding;

    if (width !== this.state.width || height !== this.state.height) {
      this.setState({
        width, height,
        nameWidth: name.offsetWidth,
        valueWidth: value.offsetWidth,
        unitsWidth: units.offsetWidth,
        rangeWidth: max ? max.offsetWidth : 0,
        fontFamily,
        fontWeight,
      });
    }
  }
  componentDidMount() {
    this.resize();
  }
  componentDidUpdate() {
    this.resize();
  }
  render() {
    var {className, value, min, max, showRange, name, color, units, 
        precision = 0, alarmState, children, ...props} = this.props;
    var {width, height, nameWidth, valueWidth, unitsWidth, rangeWidth, fontFamily, fontWeight} = this.state;

    className = classNames('gauge', className, {
      'gauge-alarm': alarmState === 'alarm',
      'gauge-warning': alarmState === 'warning',
    });
    
    function formatValue(value) {
      if (isNaN(value) || value === null) return 'NA';
      return value.toFixed(precision);
    }

    function formatRange(value) {
      let result = formatValue(value);
      let match = decimalZerosRx.exec(result);
      return match ? match[1] : result;
    }

    value       = formatValue(value);
    min         = formatRange(min);
    max         = formatRange(max);

    var nameStyle         = {color};
    var valueStyle        = {color};
    var unitsStyle        = {color};
    var rangeStyle        = {};

    if (width > 0 && height > 0 && fontFamily && fontWeight) {
      var ctx = dummyCanvas.getContext('2d');
      ctx.font = `${fontWeight} 10px ${fontFamily}`;

      var nameMetrics = ctx.measureText(name);
      nameStyle.fontSize = Math.min(height * 0.4, 17 * nameWidth / nameMetrics.width);
      nameStyle.lineHeight = nameStyle.fontSize + 'px';

      var unitsMetrics = ctx.measureText(units);
      unitsStyle.fontSize = Math.min(height / 2, 10 * unitsWidth / unitsMetrics.width);
      unitsStyle.lineHeight = unitsStyle.fontSize + 'px';

      var rangeMinMetrics = ctx.measureText(min);
      var rangeMaxMetrics = ctx.measureText(max);

      rangeStyle.fontSize = Math.min(height / 2, 10 * (rangeWidth) / Math.max(rangeMinMetrics.width, rangeMaxMetrics.width));

      var valueMetrics = ctx.measureText(value);
      valueStyle.fontSize = Math.min(height, 10 * (valueWidth) / Math.max(
        valueMetrics.width, rangeMinMetrics.width, rangeMaxMetrics.width));
      valueStyle.lineHeight = valueStyle.fontSize + 'px';
    }

    return <div ref="root" {...props} className={className} tabIndex={0}>
      <span ref="name" className="name" style={nameStyle}>{name}</span>
      <div className="value-and-units">
        <span ref="value" className="value" style={valueStyle}>{value}</span>
        <span ref="units" className="units" style={unitsStyle}>{units}</span>
      </div>
      {showRange && <div ref="range" className="range" style={rangeStyle}>
        <div ref="min"   className="min">{min}</div>
        <div ref="max"   className="max">{max}</div>
      </div>}
      {children}
    </div>
  }
}
