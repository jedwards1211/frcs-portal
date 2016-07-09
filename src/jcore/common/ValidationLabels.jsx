import React, {Component} from 'react'

import {getFormGroupContextClass, getContextContent} from '../bootstrap/bootstrapPropUtils'
import {errorMessage} from '../utils/reactErrorUtils'

import CollapseTransitionGroup from '../transition/CollapseTransitionGroup.jsx'

export default class ValidationLabels extends Component {
  render() {
    const contextClass   = getFormGroupContextClass(this.props)
    const contextContent = getContextContent       (this.props)

    return (
      <CollapseTransitionGroup component="div">
        {contextContent &&
          <div className={`control-label ${contextClass}-message`}>
            {errorMessage(contextContent)}
          </div>
        }
      </CollapseTransitionGroup>
    )
  }
}
