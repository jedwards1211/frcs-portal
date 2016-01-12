import React, {Component} from 'react';

import {AutoAlert} from '../bootstrap/Alert';
import CollapseTransitionGroup from '../transition/CollapseTransitionGroup';

export default class AutoAlertGroup extends Component {
  render() {
    const {alerts} = this.props;
    const children = [];
    for (var key in alerts) {
      let v = alerts[key];
      if (v && (v.type || v.alarm || v.error || v.danger || v.warning || v.info || v.success)) {
        children.push(<AutoAlert key={key} {...v}/>);
      }
    }
    return <CollapseTransitionGroup component="div">
      {children}
    </CollapseTransitionGroup>;
  }
}
