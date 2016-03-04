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
  let {millis, showMillis} = props;
  if (!showMillis) {
    // round
    millis = modFloor(millis + 500, 1000);
  }
  let hours   = millis > 3600000 && (Math.floor(millis / 3600000) + ':')
  let minutes = _.padStart(Math.floor(millis / 60000) % 60, 2, '0');
  let seconds = _.padStart(Math.floor(millis /  1000) % 60, 2, '0');
  let milliseconds = showMillis && (':' + _.padStart(Math.floor(millis % 1000), 3, '0'));
  return <div {...props} style={Object.assign({textAlign: 'right'}, props.style)}>
    {hours}{minutes}:{seconds}{milliseconds}
  </div>;
};

export default ElapsedTime;
