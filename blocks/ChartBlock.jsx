import React from 'react';
import classNames from 'classnames';

import FittedText from '../FittedText';

import './ChartBlock.sass';
import dummyCanvas from '../dummyCanvas';

import shouldPureComponentUpdate from 'react-pure-render/function';

export default class ChartBlock extends React.Component {
  shouldComponentUpdate = shouldPureComponentUpdate;
  constructor(props) {
    super(props);
    this.state = {width: 0, height: 0};
  }
  resize() {
    var root = React.findDOMNode(this.refs.root);
    var name = React.findDOMNode(this.refs.name);
    var value = React.findDOMNode(this.refs.value);
    var units = React.findDOMNode(this.refs.units);
    var max = React.findDOMNode(this.refs.max);
    var {offsetWidth, offsetHeight} = root;
    var {fontFamily, fontWeight} = window.getComputedStyle(root);

    this.setState({
      width: offsetWidth,
      height: offsetHeight,
      nameWidth: name.offsetWidth,
      valueWidth: value.offsetWidth,
      unitsWidth: units.offsetWidth,
      rangeWidth: max.offsetWidth,
      fontFamily,
      fontWeight,
    });
  }
  componentDidMount() {
    this.resize();
  }
  componentDidUpdate() {
    this.resize();
  }
  render() {
    var {className, name, value, units, min, max, precision, alarmState} = this.props;
    var {width, height, nameWidth, valueWidth, unitsWidth, rangeWidth, fontFamily, fontWeight} = this.state;

    className = classNames('block', 'chart-block', className, {
      'block-alarm': alarmState === 'alarm',
      'block-warning': alarmState === 'warning',
    });

    function formatValue(value) {
      if (isNaN(value) || value === null) return 'NA';
      return value.toFixed(precision);
    }

    value = formatValue(value);
    min = formatValue(min);
    max = formatValue(max);

    var valueAndUnitStyle = {};
    var nameStyle         = {};
    var innerNameStyle    = {};
    var valueStyle        = {};
    var unitsStyle        = {};
    var rangeStyle        = {};

    var padding = width / 50;

    if (width && height && fontFamily && fontWeight) {
      valueAndUnitStyle.lineHeight = height + 'px';

      var ctx = dummyCanvas.getContext('2d');
      ctx.font = `${fontWeight} 10px ${fontFamily}`;

      var nameMetrics = ctx.measureText(name);
      nameStyle.fontSize = Math.min(height / 3, 10 * nameWidth * 2 / nameMetrics.width);

      var valueMetrics = ctx.measureText(value);
      valueStyle.fontSize = Math.min(height, 10 * (valueWidth - padding) / valueMetrics.width);

      var unitsMetrics = ctx.measureText(units);
      unitsStyle.fontSize = Math.min(height / 2, 10 * unitsWidth / unitsMetrics.width);

      var rangeMinMetrics = ctx.measureText(min);
      var rangeMaxMetrics = ctx.measureText(max);

      rangeStyle.fontSize = Math.min(height / 2, 10 * (rangeWidth - padding) / (Math.max(rangeMinMetrics.width, rangeMaxMetrics.width)));
    }
    return <div ref="root" {...this.props} className={className}>
      <div ref="name" className="name" style={nameStyle}>
        <div style={innerNameStyle}>{name}</div>
      </div>
      <div className="valueAndUnit" style={valueAndUnitStyle}>
        <span ref="value" className="value" style={valueStyle}>{value}</span>
        <span ref="units" className="units" style={unitsStyle}>{units}</span>
      </div>
      <div ref="min"   className="min"   style={rangeStyle}>{min}</div>
      <div ref="max"   className="max"   style={rangeStyle}>{max}</div>
    </div>
  }
}