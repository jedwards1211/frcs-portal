import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import AlertGroup from '../common/AlertGroup.js';
import Toggle from '../common/Toggle';
import alarmTypes from './alarmTypes';

import { numberRegExp, numberOrBlankRegExp, unsignedIntegerRegExp } from '../utils/validationUtils';

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
    !unsignedIntegerRegExp.test(metadataItem.precision) ||
    _.some(metadataItem.alarms, alarmHasErrors);
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
    onEnabledChange: React.PropTypes.func,
    beforeAlarms: React.PropTypes.node
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
      <div className={classNames('form-group', {'has-error': alarmHasErrors(alarm)})}>
        <div className="label-column">
          <h4 className="control-label">{humanName}</h4>
        </div>
        <div className="input-column">
          <input name={name} type="text" inputMode="number" className="form-control" value={alarm.setpoint}
            disabled={disabled} style={{display: 'setpoint' in alarm ? undefined : 'none'}}
            onChange={this.onSetpointChange} />
        </div>
        <div className="last-column">
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
    onPrecisionChange: React.PropTypes.func,
    onAlarmSetpointChange: React.PropTypes.func,
    onAlarmEnabledChange: React.PropTypes.func
  },
  onRangeMinChange(event) {
    this.props.onRangeMinChange && this.props.onRangeMinChange(event.target.value);
  },
  onRangeMaxChange(event) {
    this.props.onRangeMaxChange && this.props.onRangeMaxChange(event.target.value);
  },
  onPrecisionChange(event) {
    this.props.onPrecisionChange && this.props.onPrecisionChange(event.target.value); 
  },
  renderRange() {
    let metadataItem = this.props.metadataItem;
    let disabled = this.props.disabled;

    return [
      <h3 key="display-range" className="display-range">Display Range</h3>,
      <div key="range" className="range" style={{margin: 0, padding: 0}}>
        <div className={classNames('form-group', {'has-error': !numberRegExp.test(metadataItem.max)})}>
          <span className="label-column">
            <h4 className="control-label">Max</h4>
          </span>
          <span className="input-column">
            <input name="range-max" type="text" inputMode="number" className="form-control" value={metadataItem.max}
              disabled={disabled} onChange={this.onRangeMaxChange} />
          </span>
          <span className="last-column">
            {metadataItem.units}
          </span>
        </div>
        <div className={classNames('form-group', {'has-error': !numberRegExp.test(metadataItem.min)})}>
          <span className="label-column">
            <h4 className="control-label">Min</h4>
          </span>
          <span className="input-column">
            <input name="range-min" type="text" inputMode="number" className="form-control" value={metadataItem.min}
                   disabled={disabled} onChange={this.onRangeMinChange} />
          </span>
          <span className="last-column">
            {metadataItem.units}
          </span>
        </div>
        <div className={classNames('form-group', {'has-error': !unsignedIntegerRegExp.test(metadataItem.precision)})}>
          <span className="label-column">
            <h4 className="control-label">Precision</h4>
          </span>
          <span className="input-column">
            <input name="precision" type="tel" className="form-control" value={metadataItem.precision}
                   disabled={disabled} onChange={this.onPrecisionChange} />
          </span>
          <span className="last-column"/>
        </div>
      </div>
    ];
  },
  renderAlarms() {
    let {metadataItem, disabled, onAlarmSetpointChange, onAlarmEnabledChange,
        beforeAlarmRows} = this.props;

    if (metadataItem.alarms) {
      let result = [];
      if (beforeAlarmRows instanceof Array) {
        result = result.concat(beforeAlarmRows.map(
          (elem, index) => React.cloneElement(elem, {key: index})));
      }
      else if (beforeAlarmRows) {
        result = result.concat(React.cloneElement(beforeAlarmRows, {key: 'beforeAlarmRows'}));
      }

      for (let type of alarmOrder) {
        let alarm = _.find(metadataItem.alarms, type);
        if (!alarm) continue;

        result.push(<AlarmRow alarm={alarm} disabled={disabled} key={type.comparison + '-' + type.severity}
          onSetpointChange={onAlarmSetpointChange && onAlarmSetpointChange.bind(null, type)}
          onEnabledChange={onAlarmEnabledChange && onAlarmEnabledChange.bind(null, type)} />);
      }

      if (result.length) {
        result.unshift(
          <div key="alarms">
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

    let alerts = {};
    if (hasErrors(metadataItem)) {
      alerts.invalidInput = {error: 'Please correct invalid input in the fields outlined in red before continuing'};
    }

    return (
      <form {...this.props} className={className}>
        {this.renderRange()}
        {this.renderAlarms()}
        <AlertGroup alerts={alerts}/>
      </form>
    );
  }
});
