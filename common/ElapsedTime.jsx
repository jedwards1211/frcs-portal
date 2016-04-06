/* @flow */

import React from 'react';
import classNames from 'classnames';

import formatElapsedTime from '../utils/formatElapsedTime';

import './ElapsedTime.sass';

type Props = {
  className?: string,
  millis: number,
  showHours?: boolean | 'auto',
  showMinutes?: boolean | 'auto',
  showSeconds?: boolean | 'auto',
  showMillis?: boolean | 'auto',
  style?: Object
};

const ElapsedTime: (props: Props) => ReactElement = (props) => {
  let {className, millis, showHours, showMinutes, showMillis, showSeconds} = props;
  if (showSeconds !== false) showSeconds = true;
  className = classNames(className, 'mf-elapsed-time');
  return <div {...props} className={className}>
    {formatElapsedTime(millis, {showHours, showMinutes, showMillis, showSeconds})}
  </div>;
};

export default ElapsedTime;
