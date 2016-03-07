/* @flow */

import React from 'react';
import _ from 'lodash';

import {modFloor} from '../plot/GridMath';

type Props = {
  millis: number,
  showMillis?: boolean,
  style?: Object
};

const ElapsedTime: (props: Props) => ReactElement = (props) => {
  const {millis, showMillis} = props;
  return <div {...props} style={Object.assign({textAlign: 'right'}, props.style)}>
    {formatElapsedTime(millis, { showMillis })}
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
  const seconds = _.padStart(Math.floor(millis /  1000) % 60, 2, '0');
  const milliseconds = options.showMillis ? (':' + _.padStart(Math.floor(millis % 1000), 3, '0')) : '';
  return `${hours}${minutes}:${seconds}${milliseconds}`;
}
