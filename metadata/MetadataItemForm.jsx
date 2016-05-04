import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import AlertGroup from '../common/AlertGroup.js';
import Toggle from '../common/Toggle';
import alarmTypes from './alarmTypes';

import { validateNumber, validateInteger } from '../utils/validationUtils';

import './MetadataItemForm.sass';

/**
 * Renders the label, setpoint input, and enabled toggle for one alarm from a metadataItem
 * object (e.g. a High Warning).
 */
const AlarmRow = React.createClass({
  propTypes: {
    alarm: React.PropTypes.object.isRequired,
    disabled: React.PropTypes.bool,
    onSetpointChange: React.PropTypes.func,
    onEnabledChange: React.PropTypes.func,
    beforeAlarms: React.PropTypes.node,
  },
  statics: {
    validate(props) {
      const {alarm} = props;
      const validation = {};
      validation.setpoint = validateNumber(alarm.setpoint, {required: true});
      validation.valid = !_.some(validation, v => v && v.error);
      return validation;
    }
  },
  onSetpointChange(event) {
    this.props.onSetpointChange && this.props.onSetpointChange(event.target.value);
  },
  render() {
    let alarm = this.props.alarm;
    let name = alarm.comparison + '-' + alarm.severity;
    let humanName = _.startCase(alarm.comparison + ' ' + alarm.severity);
    let disabled = this.props.disabled;

    let validation = AlarmRow.validate(this.props);

    return (
      <div className={classNames('form-group', {'has-error': validation.setpoint.error})}>
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
const MetadataItemForm = React.createClass({
  propTypes: {
    metadataItem: React.PropTypes.object.isRequired,
    disabled: React.PropTypes.bool,
    onRangeMinChange: React.PropTypes.func,
    onRangeMaxChange: React.PropTypes.func,
    onPrecisionChange: React.PropTypes.func,
    onAlarmSetpointChange: React.PropTypes.func,
    onAlarmEnabledChange: React.PropTypes.func,
    maxPrecision: React.PropTypes.number
  },
  statics: {
    validate(props) {
      let {metadataItem, maxPrecision} = props;
      if (maxPrecision == null) maxPrecision = 5;
      const validation = {};
      validation.min = validateNumber(metadataItem.min, {required: true});
      validation.max = validateNumber(metadataItem.max, {required: true});
      validation.precision = validateInteger(metadataItem.precision, {required: true, min: 0, max: maxPrecision});
      validation.alarms = metadataItem.alarms.map(alarm => AlarmRow.validate({alarm}));
      validation.valid = !_.some(validation, v => v && v.error) && !_.some(validation.alarms, v => v && !v.valid);
      return validation;
    } 
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
    
    let validation = MetadataItemForm.validate(this.props);

    return [
      <h3 key="display-range" className="display-range">Display Range</h3>,
      <div key="range" className="range" style={{margin: 0, padding: 0}}>
        <div className={classNames('form-group', {'has-error': validation.max.error})}>
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
        <div className={classNames('form-group', {'has-error': validation.min.error})}>
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
        <div className={classNames('form-group', {'has-error': validation.precision.error})}>
          <span className="label-column">
            <h4 className="control-label">Precision</h4>
          </span>
          <span className="input-column">
            <input name="precision" type="tel" className="form-control" value={metadataItem.precision}
                   disabled={disabled} onChange={this.onPrecisionChange} />
          </span>
          <span className="last-column"/>
        </div>
        {validation.precision.error && <div className="form-group has-error">
          <span className="label-column"/>
          <span className="input-column">
            {validation.precision.error && <div className="control-label error-message">
              {validation.precision.error}
            </div>}
          </span>
          <span className="last-column"/>
        </div>}
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
    let {className} = this.props;
    className = classNames(className, 'metadata-item-form');

    let alerts = {};
    let validation = MetadataItemForm.validate(this.props);
    if (!validation.valid) {
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

export default MetadataItemForm;
