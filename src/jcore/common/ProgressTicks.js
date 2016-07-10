/* @flow */

import React from 'react'
import classNames from 'classnames'
import _ from 'lodash'

import './ProgressTicks.sass'

type Props = {
  className?: string,
  min?: number,
  max?: number,
  increment?: number,
  style?: Object,
  format?: (value: number) => any
};

const ProgressTicks: (props: Props) => ?React.Element = props => {
  let {className} = props
  const {min, max, increment} = props
  let format = props.format || (value => value.toFixed(0))

  let divs = min != null && max != null && increment != null ? (max - min) / increment : NaN

  if (min != null && max != null && increment != null && divs != null &&
    Number.isFinite(divs) && divs > 0 && divs < 100) {
    className = classNames(className, 'mf-ProgressTicks')
    return <div {...props} className={className}>
      {_.range(min, max + increment, increment).map(value => <span key={value} style={{
        left: ((value - min) / (max - min) * 100) + '%'
      }}
                                                             >{format(value)}</span>)}
    </div>
  }
  return null
}

export default ProgressTicks
