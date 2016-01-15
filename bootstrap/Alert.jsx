import React, {Component, PropTypes} from 'react';
import addClass from '../wrappers/addClass';

import {errorMessage} from '../utils/errorUtils';

var Alert = (props) => (<div {...props} role="alert">
  {props.children}
</div>);

Alert = addClass(Alert, 'alert');
Alert.Info = addClass(Alert, 'alert alert-info');
Alert.Success = addClass(Alert, 'alert alert-success');
Alert.Warning = addClass(Alert, 'alert alert-warning');
Alert.Danger = addClass(Alert, 'alert alert-danger');
Alert.Error = Alert.Danger;
Alert.Link = addClass('a', 'alert-link');

const errorPropType = PropTypes.oneOfType([
  PropTypes.instanceOf(Error),
  PropTypes.node,
]);

export class AutoAlert extends Component {
  static propTypes = {
    type:     PropTypes.oneOf(['alarm', 'error', 'danger', 'warning', 'info', 'success']),
    alarm:    errorPropType, 
    error:    errorPropType, 
    danger:   errorPropType, 
    warning:  errorPropType, 
    info:     PropTypes.node, 
    success:  PropTypes.node,
  }
  render() {
    const {type, info, success, warning, danger, error, alarm, children} = this.props;
    if (alarm   || type === 'alarm'  ) return <Alert.Danger {...this.props}>{alarm ? errorMessage(alarm) : children}</Alert.Danger>;
    if (error   || type === 'error'  ) return <Alert.Danger {...this.props}>{error ? errorMessage(error) : children}</Alert.Danger>;
    if (danger  || type === 'danger' ) return <Alert.Danger {...this.props}>{danger ? errorMessage(danger) : children}</Alert.Danger>;
    if (warning || type === 'warning') return <Alert.Warning {...this.props}>{warning ? errorMessage(warning) : children}</Alert.Warning>;
    if (info    || type === 'info'   ) return <Alert.Info {...this.props}>{info || children}</Alert.Info>;
    if (success || type === 'success') return <Alert.Success {...this.props}>{success || children}</Alert.Success>;
  }
}

Alert.Auto = AutoAlert;

export default Alert;
