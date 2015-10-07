'use strict';

import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import alarmTypes from '../../alarmTypes';
import * as GaugePropTypes from './GaugePropTypes';

require('./AlarmLegend.sass');

export default React.createClass({
  propTypes: Object.assign({}, GaugePropTypes.alarmLegend, {
    x: React.PropTypes.number.isRequired,
    y: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
  }),
  render() {
    var {min, max, alarms, x, y, width, height, className, ...restProps} = this.props;

    if (!alarms) {
      return <g className={className} {...restProps}/>;
    }

    var smin = min;
    var smax = max;

    min = Math.min(smin, smax);
    max = Math.max(smin, smax);

    className = classNames(className, 'alarm-legend');

    var lowAlarmRect,
        lowWarningRect,
        safeZoneRect,
        highWarningRect,
        highAlarmRect;

    function getSetpoint(alarmType) {
      var alarm = _.find(alarms, alarmType);
      return alarm && alarm.enabled ? alarm.setpoint : undefined;
    }

    function makeRect(className, from, to) {
      var fromX = (from - smin) * width / (smax - smin);
      var toX   = (to   - smin) * width / (smax - smin);
      var x0 = Math.max(0,     Math.min(fromX, toX));
      var x1 = Math.min(width, Math.max(fromX, toX));
      var rx = x + x0;
      var rwidth = x1 - x0;
      return <rect className={className} x={rx} y={y} width={rwidth} height={height} />;
    }

    if (!isNaN(min) && !isNaN(max) && min !== null && max !== null &&
        isFinite(min) && isFinite(max)) {

      var lowAlarm = getSetpoint(alarmTypes.lowAlarm);
      var lowWarning = getSetpoint(alarmTypes.lowWarning);
      var highWarning = getSetpoint(alarmTypes.highWarning);
      var highAlarm = getSetpoint(alarmTypes.highAlarm);

      if (min === max) {
        if (min >= highAlarm || min <= lowAlarm) {
          lowAlarmRect = <rect className="alarm" x={x} y={y} width={width} height={height} />;
        }
        else if (min >= highWarning || min <= lowWarning) {
          lowWarningRect = <rect className="warning" x={x} y={y} width={width} height={height} />;
        }
        else {
          safeZoneRect = <rect className="safe-zone" x={x} y={y} width={width} height={height} />;
        }
      }
      else {
        var rmin = min;
        var rmax = max;

        if (lowAlarm > highAlarm || lowAlarm >= rmax || highAlarm <= rmin) {
          lowAlarmRect = makeRect('alarm', rmin, rmax);
        }
        else {
          if (lowAlarm > rmin) {
            lowAlarmRect = makeRect('alarm', rmin, lowAlarm);
            rmin = lowAlarm;
          }
          if (highAlarm < rmax) {
            highAlarmRect = makeRect('alarm', highAlarm, rmax);
            rmax = highAlarm;
          }

          if (lowWarning > highWarning || lowWarning >= rmax || highWarning <= rmin) {
            lowWarningRect = makeRect('warning', rmin, rmax);
          }
          else {
            if (lowWarning > rmin) {
              lowWarningRect = makeRect('warning', rmin, lowWarning);
              rmin = lowWarning;
            }
            if (highWarning < rmax) {
              highWarningRect = makeRect('warning', highWarning, rmax);
              rmax = highWarning;
            }

            if (lowAlarm    !== undefined ||
                lowWarning  !== undefined ||
                highWarning !== undefined ||
                highAlarm   !== undefined) {
              safeZoneRect = makeRect('safe-zone', rmin, rmax);
            }
          }
        }
      }
    }

    return <g className={className} {...restProps}>
      {safeZoneRect}
      {lowWarningRect}
      {highWarningRect}
      {lowAlarmRect}
      {highAlarmRect}
    </g>;
  }
});