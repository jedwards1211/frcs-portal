import React, {Component} from 'react';
import classNames from 'classnames';
import ArcFill from './ArcFill';
import ArcAlarmLegend from './ArcAlarmLegend';
import arcPath from '../svg/arcPath';
import GaugePropTypes from './GaugePropTypes';
import layoutSvgText from './layoutSvgText';
import dummyCanvas from '../utils/dummyCanvas';
import FontMetricsCache from '../utils/FontMetricsCache';
import {pickFontSize} from './gaugeUtils';

require('./ArcGauge.sass');

const PADDING    = 7;
const ARC_WIDTH  = 300;
const ARC_HEIGHT = ARC_WIDTH / 2;
const ARC_THICKNESS = 25;
const ARC_CENTER = [ARC_WIDTH / 2, ARC_HEIGHT];
const ARC_RADIUS = [ARC_WIDTH / 2, ARC_HEIGHT];
const LEGEND_RADIUS = [ARC_RADIUS[0] - ARC_THICKNESS, ARC_RADIUS[1] - ARC_THICKNESS];
const LEGEND_THICKNESS = 4;
const VALUE_HEIGHT = ARC_HEIGHT * 0.45;
const UNITS_HEIGHT = ARC_HEIGHT * 0.15;
const NAME_HEIGHT = ARC_HEIGHT * 0.3;
const RANGE_HEIGHT = ARC_HEIGHT * 0.15;
const VALUE_WIDTH  = ARC_WIDTH  * 0.8;
const NAME_WIDTH   = ARC_WIDTH * 0.55;
const RANGE_WIDTH  = (ARC_WIDTH - NAME_WIDTH) / 2 - PADDING;
const UNITS_WIDTH  = 2 * Math.sqrt(Math.pow(ARC_HEIGHT - ARC_THICKNESS, 2) - Math.pow(VALUE_HEIGHT + PADDING + UNITS_HEIGHT, 2));
const TOTAL_HEIGHT = ARC_HEIGHT + NAME_HEIGHT + PADDING;

const RANGE_ALT_HEIGHT = RANGE_HEIGHT;
const RANGE_ALT_WIDTH = ARC_WIDTH / 2 - PADDING * 4;
const NAME_ALT_HEIGHT = TOTAL_HEIGHT - ARC_HEIGHT - RANGE_ALT_HEIGHT;

const TRACK_PATH = arcPath(ARC_CENTER, ARC_RADIUS, ARC_THICKNESS, Math.PI, -Math.PI);

export default class ArgGauge extends Component {
  static propTypes = GaugePropTypes;
  refs = {};
  state = {};
  componentDidMount() {
    this.remeasure();
  }
  remeasure = () => {
    var {fontFamily, fontWeight} = window.getComputedStyle(this.root);
    var {fontWeight: nameFontWeight} = window.getComputedStyle(this.refs.name);

    if (fontFamily !== this.state.fontFamily || fontWeight !== this.state.fontWeight ||
        nameFontWeight !== this.state.nameFontWeight) {
      this.setState({fontFamily, fontWeight, nameFontWeight});
    }
  };
  render() {
    var {name, units, min, max, precision, alarms, value, debugRects,
        className, alarmState, children, ...restProps} = this.props;
    var {fontWeight = '', nameFontWeight = 'bold', fontFamily = 'sans-serif'} = this.state;
    var fontSize = 20;
    var font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    var fontMetrics = FontMetricsCache.getFontMetrics(font);
    var isNA = isNaN(value) || value === null;

    className = classNames(className, 'gauge arc-gauge', {
      'gauge-alarm': alarmState === 'alarm',
      'gauge-warning': alarmState === 'warning',
      'gauge-na': isNA,
    });

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
    var unitsText   = units || '';
    var nameText    = name  || '';
    var valueText   = formatValue(value);

    let lines = layoutSvgText(nameText, {
      maxWidth: NAME_WIDTH,
      maxHeight: NAME_HEIGHT + PADDING,
      maxFontSize: 30,
      fontWeight: nameFontWeight,
      fontFamily,
      x: ARC_WIDTH / 2,
      y: ARC_HEIGHT + PADDING,
    });

    let minStyle = makeStyle(minText, RANGE_WIDTH, RANGE_HEIGHT);
    let maxStyle = makeStyle(maxText, RANGE_WIDTH, RANGE_HEIGHT);
    minStyle.fontSize = maxStyle.fontSize = Math.min(minStyle.fontSize, maxStyle.fontSize, lines.fontSize);

      var altLines = layoutSvgText(nameText, {
        maxWidth: ARC_WIDTH,
        maxHeight: NAME_ALT_HEIGHT,
        maxFontSize: 30,
        fontWeight: nameFontWeight,
        fontFamily,
        x: ARC_WIDTH / 2,
        y: ARC_HEIGHT + RANGE_ALT_HEIGHT + PADDING * 2,
      });

      var altMinStyle = makeStyle(minText, RANGE_ALT_WIDTH, RANGE_ALT_HEIGHT);
      var altMaxStyle = makeStyle(maxText, RANGE_ALT_WIDTH, RANGE_ALT_HEIGHT);
      altMinStyle.fontSize = altMaxStyle.fontSize = Math.min(
        altMinStyle.fontSize, altMaxStyle.fontSize);

      if (altMinStyle.fontSize > minStyle.fontSize && altLines.fontSize > lines.fontSize) {
        lines = altLines;
        minStyle = altMinStyle;
        maxStyle = altMaxStyle;
      }

    return (
      <div ref={c => this.root = c} className={className} {...restProps}>
        <svg key="svg" ref="svg" viewBox={`0 0 ${ARC_WIDTH} ${TOTAL_HEIGHT}`} preserveAspectRatio="xMidYMid meet">
          <path key="track" className="track" d={TRACK_PATH} />
          <ArcFill  key="fill" className={classNames('fill', {'na': isNA})}
                    center={ARC_CENTER} radius={ARC_RADIUS} minAngle={Math.PI} angularSpan={-Math.PI}
                    thickness={ARC_THICKNESS} min={min} max={max} value={value} />

          <ArcAlarmLegend key="legend" center={ARC_CENTER} radius={LEGEND_RADIUS} thickness={LEGEND_THICKNESS}
                          minAngle={Math.PI} angularSpan={-Math.PI} min={min} max={max} alarms={alarms} />

          <text key="min"   ref="min"   className="min"   x={0}             y={ARC_HEIGHT + PADDING} style={minStyle}>
            {minText}
          </text>
          <text key="max"   ref="max"   className="max"   x={ARC_WIDTH}     y={ARC_HEIGHT + PADDING} style={maxStyle}>
            {maxText}
          </text>
          <text key="value" ref="value" className="value" x={ARC_WIDTH / 2} y={ARC_HEIGHT} style={makeStyle(valueText, VALUE_WIDTH, VALUE_HEIGHT)}>
            {valueText}
          </text>
          <text key="units" ref="units" className="units" x={ARC_WIDTH / 2} y={ARC_HEIGHT - VALUE_HEIGHT - PADDING} style={makeStyle(unitsText, UNITS_WIDTH, UNITS_HEIGHT)}>
            {unitsText}
          </text>
          <g className="name" ref={c => this.refs.name = c}>
            {lines}
          </g>
          {debugRects && [
            <rect key="name" x={(ARC_WIDTH - NAME_WIDTH) / 2} y={ARC_HEIGHT + PADDING} width={NAME_WIDTH} height={NAME_HEIGHT + PADDING}
                  style={{fill: 'none', stroke: 'blue'}}/>
          ]}
        </svg>
        {children}
      </div>
    );
  }
}