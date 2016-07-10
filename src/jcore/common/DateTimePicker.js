/* @flow */

import React, {Component} from 'react'
import classNames from 'classnames'
// $ShutUpFlow
import moment from 'moment'
const Moment = moment.fn

import DatePicker from './DatePicker'
import TimePicker from './TimePicker'

import './DateTimePicker.sass'

type Props = {
  className?: string,
  value?: Moment,
  showSeconds?: boolean,
  onChange?: (newValue: Moment) => any
};

export default class DateTimePicker extends Component<void, Props, void> {
  onDateChange: (newDate: Moment) => void = newDate => {
    let {value, onChange} = this.props
    if (onChange) {
      if (!value) onChange(moment(newDate))
      onChange(moment(value).year(newDate.year()).month(newDate.month()).date(newDate.date()))
    }
  };
  onTimeChange: (newTime: Date) => void = newTime => {
    let {value, onChange} = this.props
    if (onChange) {
      if (!value) onChange(moment(newTime))
      onChange(moment(value).hour(newTime.getHours()).minute(newTime.getMinutes()).second(newTime.getSeconds())
        .millisecond(newTime.getMilliseconds()))
    }
  };
  render(): React.Element {
    let {props: {className, value, showSeconds}, onDateChange, onTimeChange} = this
    className = classNames(className, 'mf-date-time-picker')

    return <div {...this.props} className={className} onChange={e => e.stopPropagation()}>
      <DatePicker value={value} onChange={onDateChange} />
      <TimePicker value={value && value.toDate()} showSeconds={showSeconds} onChange={onTimeChange} />
    </div>
  }
}
