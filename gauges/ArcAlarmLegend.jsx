'use strict';

import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import alarmTypes from './alarmTypes';
import arcPath from '../arcPath';
import {alarmLegendPropTypes} from './GaugePropTypes';

require('./AlarmLegend.sass');

export default React.createClass({
  propTypes: Object.assign({}, alarmLegendPropTypes, {
    minAngle: React.PropTypes.number.isRequired,
    angularSpan: React.PropTypes.number.isRequired,
    center: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
    radius: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
    thickness: React.PropTypes.number.isRequired,
  }),
  render() {
    var {min, max, alarms, minAngle, angularSpan,
        center, radius, thickness, className, ...restProps} = this.props;

    if (!alarms) {
      return <g className={className} {...restProps}/>;
    }

    className = classNames(className, 'alarm-legend');

    if (min > max) {
      var swap = min;
      min = max;
      max = swap;
      minAngle += angularSpan;
      angularSpan = -angularSpan;
    }

    var lowAlarmPath,
        lowWarningPath,
        safeZonePath,
        highWarningPath,
        highAlarmPath;

    function getSetpoint(alarmType) {
      var alarm = _.find(alarms, alarmType);
      return alarm && alarm.enabled ? alarm.setpoint : undefined;
    }

    function makePath(className, from, to) {
      from = Math.max(min, from);
      to = Math.min(max, to);
      var startAngle = minAngle + angularSpan * (from - min) / (max - min);
      var span = angularSpan * (to - from) / (max - min);
      return <path className={className} d={arcPath(center, radius, thickness, startAngle, span)} />;
    }

    if (!isNaN(min) && !isNaN(max) && min !== null && max !== null &&
        isFinite(min) && isFinite(max)) {

      var lowAlarm = getSetpoint(alarmTypes.lowAlarm);
      var lowWarning = getSetpoint(alarmTypes.lowWarning);
      var highWarning = getSetpoint(alarmTypes.highWarning);
      var highAlarm = getSetpoint(alarmTypes.highAlarm);

      if (min === max) {
        if (min >= highAlarm || min <= lowAlarm) {
          lowAlarmPath = <path className="alarm" d={arcPath(center, radius, thickness, minAngle, angularSpan)} />;
        }
        else if (min >= highWarning || min <= lowWarning) {
          lowWarningPath = <path className="warning" d={arcPath(center, radius, thickness, minAngle, angularSpan)} />;
        }
        else {
          safeZonePath = <path className="safe-zone" d={arcPath(center, radius, thickness, minAngle, angularSpan)} />;
        }
      }
      else {
        var rmin = min;
        var rmax = max;

        if (lowAlarm > highAlarm || lowAlarm >= rmax || highAlarm <= rmin) {
          lowAlarmPath = makePath('alarm', rmin, rmax);
        }
        else {
          if (lowAlarm > rmin) {
            lowAlarmPath = makePath('alarm', rmin, lowAlarm);
            rmin = lowAlarm;
          }
          if (highAlarm < rmax) {
            highAlarmPath = makePath('alarm', highAlarm, rmax);
            rmax = highAlarm;
          }

          if (lowWarning > highWarning || lowWarning >= rmax || highWarning <= rmin) {
            lowWarningPath = makePath('warning', rmin, rmax);
          }
          else {
            if (lowWarning > rmin) {
              lowWarningPath = makePath('warning', rmin, lowWarning);
              rmin = lowWarning;
            }
            if (highWarning < rmax) {
              highWarningPath = makePath('warning', highWarning, rmax);
              rmax = highWarning;
            }

            if (lowAlarm    !== undefined ||
                lowWarning  !== undefined ||
                highWarning !== undefined ||
                highAlarm   !== undefined) {
              safeZonePath = makePath('safe-zone', rmin, rmax);
            }
          }
        }
      }
    }

    return (
      <g className={className} {...restProps}>
        {safeZonePath}
        {lowWarningPath}
        {highWarningPath}
        {lowAlarmPath}
        {highAlarmPath}
      </g>
    );
  }
});