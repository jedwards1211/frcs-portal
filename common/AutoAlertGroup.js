import React, {Component} from 'react';

import {AutoAlert} from '../bootstrap/Alert';
import CollapseTransitionGroup from '../transition/CollapseTransitionGroup';

export default class AutoAlertGroup extends Component {
  render() {
    const {alerts} = this.props;
    return <CollapseTransitionGroup component="div">
      {alerts && Object.keys(alerts).map(key => {
        const v = alerts[key];
        if (v && (v.error || v.danger || v.warning || v.info || v.success)) {
          return <AutoAlert key={key} {...v}/>;
        }
      })}
    </CollapseTransitionGroup>;
  }
}
