/* @flow */

import React, {Component} from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import Clock from './Clock.jsx';
import Dropdown from '../bootstrap/Dropdown.jsx';
import Input from '../bootstrap/Input.jsx';
import InputGroup from '../bootstrap/InputGroup.jsx';
import Button from '../bootstrap/Button.jsx';

import type {FormValidation} from '../flowtypes/validationTypes';

import './TimePicker.sass';

type DefaultProps = {
  showSeconds?: boolean,
  showAMPM?: boolean
};

type Props = DefaultProps & {
  className?: string,
  time?: Date,
  onChange?: (time: Date) => any,
};

type State = {
  timeString: string,
  controlledHand: 'hour' | 'minute' | 'second'
};

function parseTimeString(baseTime: ?Date, timeString: string): Date {
  let time = baseTime || new Date();
  let dateString = time.toLocaleDateString();
  let newTime = new Date(dateString + ' ' + timeString);
  if (!isNaN(newTime.getTime())) {
    if (!/[apAP]/.test(timeString) && newTime.getHours() < 12 && time.getHours() >= 12) {
      newTime.setHours((newTime.getHours() + 12) % 24);
    }
  }
  return newTime;
}

export default class TimePicker extends Component<DefaultProps,Props,State> {
  static formControlValueProp = 'time';
  static defaultProps = {
    showSeconds: false,
    showAMPM: true
  };
  
  constructor(props: Props) {
    super(props);
    this.state = {
      timeString: this.formatTime(props.time),
      controlledHand: 'hour'
    };
  }

  formatTime: (time: ?Date) => string = time => {
    if (!time || isNaN(time.getTime())) {
      return '';
    }
    let {showSeconds} = this.props;
    let result = `${(time.getHours() % 12) || 12}:${_.padStart(time.getMinutes(), 2, '0')}`;
    if (showSeconds) {
      result += `:${_.padStart(time.getSeconds(), 2, '0')}`;
    }
    return result;
  };

  componentWillReceiveProps(nextProps: Props) {
    let {time} = nextProps;
    let {timeString} = this.state;
    if (time) {
      let inputTime = parseTimeString(time, timeString);
      if (!isNaN(inputTime.getTime()) && inputTime.getTime() !== time.getTime()) {
        this.setState({timeString: this.formatTime(time)});
      }
    }
  }
  onTimeStringChange: (e: Object) => void = e => {
    let {value} = e.target;
    this.setState({timeString: value}, () => {
      if (value) {
        let {time, onChange} = this.props;
        let newTime = parseTimeString(time, value);
        if (onChange && !isNaN(newTime.getTime())) {
          onChange(newTime);
        }
      }
    });
  };
  onTimeInputBlur: () => void = () => this.setState({
    timeString: this.formatTime(this.props.time)
  });
  onNumberClick: (number: number) => void = number => {
    let {time, onChange, showSeconds} = this.props;
    time = time || new Date();
    let {controlledHand} = this.state;
    let newTime = new Date(time);
    switch (controlledHand) {
      case 'hour':
        newTime.setHours(number < 12 === time.getHours() < 12 ? number : (number + 12) % 24);
        newTime.setMinutes(0);
        newTime.setSeconds(0);
        newTime.setMilliseconds(0);
        this.setState({controlledHand: 'minute'});
        break;
      case 'minute':
        newTime.setMinutes(number);
        newTime.setSeconds(0);
        newTime.setMilliseconds(0);
        this.setState({controlledHand: showSeconds ? 'second' : 'hour'});
        break;
      case 'second':
        newTime.setSeconds(number);
        newTime.setMilliseconds(0);
        this.setState({controlledHand: 'hour'});
        break;
    }
    onChange && onChange(newTime);
  };
  onAMPMClick: () => void = () => {
    let {time, onChange} = this.props; 
    if (time && onChange) {
      let newTime = new Date(time);
      newTime.setHours((time.getHours() + 12) % 24);
      onChange(newTime); 
    }
  };
  static validate: (props: Props, state: State) => FormValidation = (props, state) => {
    let result = {};
    let {time} = props;
    let {timeString} = state;
    let parsedTime = parseTimeString(time, timeString);
    if (!timeString || !parsedTime || isNaN(parsedTime.getTime())) {
      result.timeString = {error: 'Please enter a valid time'};
    }
    result.valid = !_.some(result, v => v.error);
    return result;
  };
  render(): ReactElement {
    let {time, className, showSeconds, showAMPM} = this.props;
    let {timeString, controlledHand} = this.state;

    className = classNames(className, 'mf-time-picker');
    
    let type = controlledHand === 'hour' ? 12 : 60;
    
    let toggle = <Input className="mf-time-picker-time-input" type="text" value={timeString}
                    onChange={this.onTimeStringChange} onBlur={this.onTimeInputBlur}/>;
    if (showAMPM) {
      toggle = <InputGroup>
        {toggle}
        <Button onClick={this.onAMPMClick}>{time && (time.getHours() < 12 ? 'AM' : 'PM')}</Button>
      </InputGroup>;
    }
    
    return <div {...this.props} onChange={e => e.stopPropagation()} className={className}>
      <Dropdown component="div" closeOnInsideClick={false} closeOnToggleClick={false} trackFocus>
        {toggle}
        <div>
          <Clock time={time} type={type} hoverable onNumberClick={this.onNumberClick}
                 controlledHand={controlledHand} showSeconds={!!showSeconds}/>
        </div>
      </Dropdown>
    </div>;
  }
}
