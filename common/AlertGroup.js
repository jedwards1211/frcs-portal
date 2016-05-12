import React, {Component, PropTypes} from 'react'

import {getContextClass} from '../bootstrap/bootstrapPropUtils'

import Alert from '../bootstrap/Alert'
import CollapseTransitionGroup from '../transition/CollapseTransitionGroup'

export default class AlertGroup extends Component {
  static propTypes = {
    animated: PropTypes.bool,
    alerts: PropTypes.object,
  };
  render() {
    const {animated, alerts} = this.props
    const children = []
    if (alerts) {
      for (var key in alerts) {
        let alert = alerts[key]
        if (alert) {
          if (React.isValidElement(alert)) {
            children.push(React.cloneElement(alert, {key}))
          }
          if (getContextClass(alert)) {
            children.push(<Alert key={key} {...alert} />)
          }
        }
      }
    }
    if (animated !== false) {
      return <CollapseTransitionGroup component="div" {...this.props}>
        {children}
      </CollapseTransitionGroup>
    }
    return <div {...this.props}>{children}</div>
  }
}
