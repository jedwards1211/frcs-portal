/* @flow */

import React, {Component} from 'react'
import classNames from 'classnames'
import _ from 'lodash'

import './Clock.sass'

const RADIUS = 100
const HOUR_RADIUS = 0.8 * RADIUS
const HOUR_WELL_RADIUS = 0.15 * RADIUS
const HOUR_HAND_RADIUS = 0.55 * RADIUS
const MINUTE_HAND_RADIUS = 0.85 * RADIUS
const SECOND_HAND_RADIUS = 0.9 * RADIUS

type Props = {
  className?: string,
  hoverable?: boolean,
  inverse?: boolean,
  time?: number | Date,
  type: 12 | 24 | 60,
  showHours?: boolean,
  showMinutes?: boolean,
  showSeconds?: boolean,
  onNumberClick?: (number: number) => any,
  controlledHand?: 'hour' | 'minute' | 'second'
};

const Hand = (props) => {
  let {angle, radius, className, controlled} = props
  className = classNames(className, {'mf-clock-hand--controlled': controlled})
  return <g {...props} className={className} transform={`rotate(${angle * 360})`}>
    <circle cx={0} cy={0} r={2} />
    <path d={`M 0 ${radius * 0.25} L 0 ${-radius}`} />
  </g>
}

type State = {
  hoveredNumber?: number
};

export default class Clock extends Component<void, Props, State> {
  state: State = {};
  render(): React.Element {
    let {time, showHours, showMinutes, showSeconds, className, hoverable, inverse, onNumberClick,
        controlledHand} = this.props
    let {hoveredNumber} = this.state
    let type = this.props.type || 12
    let date    = time && (time instanceof Date ? time : new Date(time))

    let hourHand, minuteHand, secondHand

    if (date) {
      let hours = date.getHours()
      let minutes = date.getMinutes()
      let seconds = date.getSeconds()
      let milliseconds = date.getMilliseconds()

      let fracSeconds = seconds + milliseconds / 1000
      let fracMinutes = minutes + fracSeconds / 60
      let fracHours = hours + fracMinutes / 60

      hourHand    = showHours   !== false && <Hand className="mf-clock-hour-hand"
          controlled={controlledHand === 'hour'}
          angle={(controlledHand === 'hour' && hoveredNumber !== undefined ? hoveredNumber : fracHours) /
                                                          (type === 60 ? 12 : type)}
          radius={HOUR_HAND_RADIUS}
                                             />
      minuteHand  = showMinutes !== false && <Hand className="mf-clock-minute-hand"
          controlled={controlledHand === 'minute'}
          angle={(controlledHand === 'minute' && hoveredNumber !== undefined ? hoveredNumber : fracMinutes) / 60}
          radius={MINUTE_HAND_RADIUS}
                                             />
      secondHand  = showSeconds !== false && <Hand className="mf-clock-second-hand"
          controlled={controlledHand === 'second'}
          angle={(controlledHand === 'second' && hoveredNumber !== undefined ? hoveredNumber : fracSeconds) / 60} radius={SECOND_HAND_RADIUS}
                                             />
    }

    className = classNames(className, 'mf-clock noselect', {
      'mf-clock--hoverable': hoverable,
      'mf-clock--inverse': inverse
    })

    let range = type === 60 ? _.range(0, 60, 5) : _.range(1, type + 1)

    return <svg preserveAspectRatio="xMidYMid meet" {...this.props}
        viewBox={`-${RADIUS} -${RADIUS} ${RADIUS*2} ${RADIUS*2}`} className={className}
           >
      <circle className="mf-clock-face" cx={0} cy={0} r={RADIUS - 1} />
      {range.map(number => {
        let angle = Math.PI * 2 * number / type
        let x =  Math.sin(angle) * HOUR_RADIUS
        let y = -Math.cos(angle) * HOUR_RADIUS
        return <g key={number} className="mf-clock-hour-group" transform={`translate(${x} ${y})`}
            onClick={() => {
              this.setState({hoveredNumber: undefined})
              onNumberClick && onNumberClick(number)
            }}
            onMouseEnter={() => this.setState({hoveredNumber: number})}
            onMouseLeave={() => this.setState({hoveredNumber: undefined})}
               >
          <circle className="mf-clock-hour-well" cx={0} cy={0} r={HOUR_WELL_RADIUS} />
          <text className="mf-clock-hour" x={0} y={0}>
            {number}
          </text>
        </g>
      })}
      {hourHand}
      {minuteHand}
      {secondHand}
    </svg>
  }
}
