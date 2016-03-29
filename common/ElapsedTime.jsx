/* @flow */

import React from 'react';
import classNames from 'classnames';

import formatElapsedTime from '../utils/formatElapsedTime';

import './ElapsedTime.sass';

type Props = {
  className?: string,
  millis: number,
  showSeconds?: boolean,
  showMillis?: boolean,
  style?: Object
};

const ElapsedTime: (props: Props) => ReactElement = (props) => {
  let {className, millis, showMillis, showSeconds} = props;
  if (showSeconds !== false) showSeconds = true;
  className = classNames(className, 'mf-elapsed-time');
  return <div {...props} className={className}>
    {formatElapsedTime(millis, {showMillis, showSeconds})}
  </div>;
};

export default ElapsedTime;
