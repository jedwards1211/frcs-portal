import React from 'react';
import addClass from '../wrappers/addClass';

var Button = (props) => (<button {...props} type="button">
  {props.children}
</button>);

Button = addClass(Button, 'btn btn-default');
Button.Primary = addClass(Button, 'btn btn-primary');
Button.Info = addClass(Button, 'btn btn-info');
Button.Success = addClass(Button, 'btn btn-success');
Button.Warning = addClass(Button, 'btn btn-warning');
Button.Danger = addClass(Button, 'btn btn-danger');

export default Button;
