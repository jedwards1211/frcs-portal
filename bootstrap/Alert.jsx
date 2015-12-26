import React, {Component} from 'react';
import addClass from '../wrappers/addClass';

var Alert = (props) => (<div {...props} role="alert">
  {props.children}
</div>);

Alert = addClass(Alert, 'alert');
Alert.Info = addClass(Alert, 'alert alert-info');
Alert.Success = addClass(Alert, 'alert alert-success');
Alert.Warning = addClass(Alert, 'alert alert-warning');
Alert.Danger = addClass(Alert, 'alert alert-danger');
Alert.Link = addClass('a', 'alert-link');

export default Alert;

export class AutoAlert extends Component {
  render() {
    const {info, success, warning, danger, error} = this.props;
    if (error)    return <Alert.Danger>{error}</Alert.Danger>;
    if (danger)   return <Alert.Danger>{danger}</Alert.Danger>;
    if (warning)  return <Alert.Warning>{warning}</Alert.Warning>;
    if (info)     return <Alert.Info>{info}</Alert.Info>;
    if (success)  return <Alert.Success>{success}</Alert.Success>;
  }
}
