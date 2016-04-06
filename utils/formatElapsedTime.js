/* @flow */

import _ from 'lodash';

import {modFloor} from '../plot/GridMath';

type ElapsedTimeOpts = {
  showHours?: boolean,
  showMillis?: boolean
}

export default function formatElapsedTime(millis: number, options?: ElapsedTimeOpts = {}) : string {
  if (!options.showMillis) {
    // round
    millis = modFloor(millis + 500, 1000);
  }
  const hours   = (millis > 3600000 || options.showHours || !(options.showSeconds || options.showMillis)) ? 
    (Math.floor(millis / 3600000) + ':') : '';
  const minutes = _.padStart(Math.floor(millis / 60000) % 60, 2, '0');
  const seconds = options.showSeconds ? (':' + _.padStart(Math.floor(millis /  1000) % 60, 2, '0')) : '';
  const milliseconds = options.showMillis ? (':' + _.padStart(Math.floor(millis % 1000), 3, '0')) : '';
  return `${hours}${minutes}${seconds}${milliseconds}`;
}
