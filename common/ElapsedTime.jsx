/* @flow */

import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import {modFloor} from '../plot/GridMath';

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

type ElapsedTimeOpts = {
  showMillis?: boolean
}

export function formatElapsedTime(millis: number, options?: ElapsedTimeOpts = {}) : string {
  if (!options.showMillis) {
    // round
    millis = modFloor(millis + 500, 1000);
  }
  const hours   = (millis > 3600000) ? (Math.floor(millis / 3600000) + ':') : '';
  const minutes = _.padStart(Math.floor(millis / 60000) % 60, 2, '0');
  const seconds = options.showSeconds ? (':' + _.padStart(Math.floor(millis /  1000) % 60, 2, '0')) : '';
  const milliseconds = options.showMillis ? (':' + _.padStart(Math.floor(millis % 1000), 3, '0')) : '';
  return `${hours}${minutes}${seconds}${milliseconds}`;
}
