import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import Collapse from '../bootstrap/Collapse';
import Alert from '../bootstrap/Alert';

import Toggle from '../Toggle';
import alarmTypes from './alarmTypes';

import { numberRegExp, numberOrBlankRegExp } from '../validationRegExps';

import './MetadataItemForm.sass';

function alarmHasErrors(alarm) {
  if (typeof alarm.setpoint === 'string' && !numberOrBlankRegExp.test(alarm.setpoint)) {
    return true;
  }
  if (!alarm.setpoint && alarm.setpoint !== 0) {
    return true; 
  }
  return false;
}

export function hasErrors(metadataItem) {
  return !numberRegExp.test(metadataItem.min) ||
    !numberRegExp.test(metadataItem.max) ||
    _.any(metadataItem.alarms, alarmHasErrors);
}

/**
 * Renders the label, setpoint input, and enabled toggle for one alarm from a metadataItem
 * object (e.g. a High Warning).
 */
let AlarmRow = React.createClass({
  propTypes: {
    alarm: React.PropTypes.object.isRequired,
    disabled: React.PropTypes.bool,
    onSetpointChange: React.PropTypes.func,
    onEnabledChange: React.PropTypes.func
  },
  onSetpointChange(event) {
    this.props.onSetpointChange && this.props.onSetpointChange(event.target.value);
  },
  render() {
    let alarm = this.props.alarm;
    let name = alarm.comparison + '-' + alarm.severity;
    let humanName = _.startCase(alarm.comparison + ' ' + alarm.severity);
    let disabled = this.props.disabled;

    return (
      <div className={classNames('AlarmRow', 'form-group', {'has-error': alarmHasErrors(alarm)})}>
        <div key="alarm-name" className="alarm-name">
          <h4 className="control-label">{humanName}</h4>
        </div>
        <div key="alarm-setpoint" className="alarm-setpoint">
          <input name={name} type="text" inputMode="number" className="form-control" value={alarm.setpoint}
            disabled={disabled} style={{display: 'setpoint' in alarm ? undefined : 'none'}}
            onChange={this.onSetpointChange} />
        </div>
        <div key="alarm-enabled" className="alarm-enabled">
          <Toggle checked={alarm.enabled} className={alarm.severity} 
            disabled={disabled} onChange={this.props.onEnabledChange} />
        </div>
      </div>
    );
  }
});

let alarmOrder = [
  alarmTypes.highAlarm,
  alarmTypes.highWarning,
  alarmTypes.lowWarning,
  alarmTypes.lowAlarm
];

/**
 * Renders the range and alarm settings for a metadataItem object.
 */
export default React.createClass({
  propTypes: {
    metadataItem: React.PropTypes.object.isRequired,
    disabled: React.PropTypes.bool,
    onRangeMinChange: React.PropTypes.func,
    onRangeMaxChange: React.PropTypes.func,
    onAlarmSetpointChange: React.PropTypes.func,
    onAlarmEnabledChange: React.PropTypes.func
  },
  onRangeMinChange(event) {
    this.props.onRangeMinChange && this.props.onRangeMinChange(event.target.value);
  },
  onRangeMaxChange(event) {
    this.props.onRangeMaxChange && this.props.onRangeMaxChange(event.target.value);
  },
  renderRange() {
    let metadataItem = this.props.metadataItem;
    let disabled = this.props.disabled;

    if ('min' in metadataItem && 'max' in metadataItem) {
      return [
        <h3 key="display-range" className="display-range">Display Range</h3>,
        <div key="range" className="range" style={{margin: 0, padding: 0}}>
          <div key="min" className={classNames('min', 'form-group', {'has-error': !numberRegExp.test(metadataItem.min)})}>
            <span key="from" className="from">
              <h4 className="control-label">From</h4>
            </span>
            <span key="value" className="value">
              <input name="range-min" type="text" inputMode="number" className="form-control" value={metadataItem.min}
                disabled={disabled} onChange={this.onRangeMinChange} />
            </span>
            <span key="units" className="units">
              {metadataItem.units}
            </span>
          </div>
          <div key="max" className={classNames('max', 'form-group', {'has-error': !numberRegExp.test(metadataItem.max)})}>
            <span key="to" className="to">
              <h4 className="control-label">To</h4>
            </span>
            <span key="value" className="value">
              <input name="range-max" type="text" inputMode="number" className="form-control" value={metadataItem.max}
                disabled={disabled} onChange={this.onRangeMaxChange} />
            </span>
            <span key="units" className="units">
              {metadataItem.units}
            </span>
          </div>
        </div>
      ];
    }
  },
  renderAlarms() {
    let metadataItem = this.props.metadataItem;
    let disabled = this.props.disabled;
    let onAlarmSetpointChange = this.props.onAlarmSetpointChange;
    let onAlarmEnabledChange = this.props.onAlarmEnabledChange;

    if (metadataItem.alarms) {
      let result = [];

      for (let type of alarmOrder) {
        let alarm = _.find(metadataItem.alarms, type);
        if (!alarm) continue;

        result.push(<AlarmRow alarm={alarm} disabled={disabled} key={type.comparison + '-' + type.severity}
          onSetpointChange={onAlarmSetpointChange && onAlarmSetpointChange.bind(null, type)}
          onEnabledChange={onAlarmEnabledChange && onAlarmEnabledChange.bind(null, type)} />);
      }

      if (result.length) {
        result.unshift(
          <div key="alarms" className="alarms">
            <h3>Alarms</h3>
          </div>
        );
        return result;
      }
    }
  },
  render() {
    let {className, metadataItem} = this.props;
    className = classNames(className, 'metadata-item-form');

    return (
      <div {...this.props} className={className}>
        {this.renderRange()}
        {this.renderAlarms()}
        <Collapse className="error-alert" open={hasErrors(metadataItem)}>
          <Alert.Danger>
            Please correct invalid input in the fields outlined in red before continuing
          </Alert.Danger>
        </Collapse>
      </div>
    );
  }
});
