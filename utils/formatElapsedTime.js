/* @flow */

import _ from 'lodash';

import {modFloor} from '../plot/GridMath';

type ElapsedTimeOpts = {
  showHours?: boolean | 'auto',
  showMinutes?: boolean | 'auto',
  showMillis?: boolean | 'auto',
  showSeconds?: boolean | 'auto'
}

export default function formatElapsedTime(millis: number, options?: ElapsedTimeOpts = {}) : string {
  let {showHours, showMinutes, showMillis, showSeconds} = options;
  
  const sign = millis < 0 ? '-' : '';
  millis = Math.abs(millis);
  
  if (showMillis === 'auto') {
    showMillis = (millis % 1000) !== 0;
  }
  if (showSeconds === 'auto') {
    showSeconds = showMillis || (millis % 60000) !== 0;
  }
  if (showHours === 'auto') {
    showHours = millis >= 3600000 || !(showSeconds || showMillis);
  }
  if (showMinutes === 'auto') {
    showMinutes = millis >= 60000 || showHours;
  }

  if (!showMillis) {
    // round
    millis = modFloor(millis + 500, 1000);
  }
  const hours   = showHours !== false ? (Math.floor(millis / 3600000) + ':') : '';
  const minutes = showMinutes !== false ? _.padStart(Math.floor(millis / 60000) % 60, 2, '0') : '';
  const seconds = showSeconds !== false ? (':' + _.padStart(Math.floor(millis /  1000) % 60, 2, '0')) : '';
  const milliseconds = showMillis !== false ? (':' + _.padStart(Math.floor(millis % 1000), 3, '0')) : '';
  return `${sign}${hours}${minutes}${seconds}${milliseconds}`;
}
