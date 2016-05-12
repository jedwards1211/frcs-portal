/* @flow */

import React, {Component} from 'react'
import classNames from 'classnames'

import {getDirection} from '../utils/propUtils'
import {directionSides} from '../utils/orient'

type Props = {
  className?:   string,
  style?:       Object,
  shaftWidth:   number,
  shaftLength:  number,
  headWidth:    number,
  headLength:   number,
  direction?:   'up' | 'down' | 'left' | 'right',
  up?:          boolean,
  down?:        boolean,
  left?:        boolean,
  right?:       boolean,
  unclosed?:    boolean,
  fill?:        string,
  stroke?:      string, // man, the innuendo here is uncanny
  strokeWidth?: number,
};

export default class Arrow extends Component<void, Props, void> {
  render(): React.Element {
    let {className, style,
        shaftWidth, shaftLength, headWidth, headLength,
        unclosed} = this.props

    let direction = getDirection(this.props)

    let side = directionSides[direction] || directionSides.right
    let axis = side.axis
    let oaxis = axis.opposite

    let bounds = {}

    bounds[side.name] = headLength * side.direction
    bounds[side.opposite.name] = -shaftLength * side.direction
    bounds[oaxis.loSide.name] = -headWidth/2
    bounds[oaxis.hiSide.name] = headWidth/2

    function p(x, y) {
      return axis.reorder(x * side.direction, y).join(',')
    }

    let pathd = `M${p(-shaftLength, -shaftWidth/2)}
  L${p(0, -shaftWidth/2)}
  L${p(0, -headWidth/2)}
  L${p(headLength, 0)}
  L${p(0, headWidth/2)}
  L${p(0, shaftWidth/2)}
  L${p(-shaftLength, shaftWidth/2)}`

    if (!unclosed) {
      pathd += ' z'
    }

    let width = bounds.right - bounds.left
    let height = bounds.bottom - bounds.top

    return <svg {...this.props} viewBox={`${bounds.left} ${bounds.top} ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className={classNames(className, 'mf-arrow')}
        style={Object.assign({}, style, {width, height})}
           >
      <path d={pathd} {...this.props} />
    </svg>
  }
}
