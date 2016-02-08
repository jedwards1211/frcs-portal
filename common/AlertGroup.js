import React, {Component, PropTypes} from 'react';

import {getContextClass} from '../bootstrap/bootstrapPropUtils';

import Alert from '../bootstrap/Alert';
import CollapseTransitionGroup from '../transition/CollapseTransitionGroup';

export default class AlertGroup extends Component {
  static propTypes = {
    alerts: PropTypes.object,
  };
  render() {
    const {alerts} = this.props;
    const children = [];
    if (alerts) {
      for (var key in alerts) {
        let props = alerts[key];
        if (getContextClass(props)) {
          children.push(<Alert key={key} {...props}/>);
        }
      }
    }
    return <CollapseTransitionGroup component="div" {...this.props}>
      {children}
    </CollapseTransitionGroup>;
  }
}
