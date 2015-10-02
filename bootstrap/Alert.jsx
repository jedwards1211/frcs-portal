import React from 'react';
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
