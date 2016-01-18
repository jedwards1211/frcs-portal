import React, {Component, PropTypes} from 'react';

import Alert from '../bootstrap/Alert';
import CollapseTransitionGroup from '../transition/CollapseTransitionGroup';

export default class AutoAlertGroup extends Component {
  static propTypes = {
    alerts: PropTypes.object,
  };
  render() {
    const {alerts} = this.props;
    const children = [];
    if (alerts) {
      for (var key in alerts) {
        let v = alerts[key];
        if (v && (v.type || v.alarm || v.error || v.danger || v.warning || v.info || v.success)) {
          children.push(<Alert.Auto key={key} {...v}/>);
        }
      }
    }
    return <CollapseTransitionGroup component="div">
      {children}
    </CollapseTransitionGroup>;
  }
}
