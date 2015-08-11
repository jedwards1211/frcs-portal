import React from 'react';
import addClass from '../wrappers/addClass';

var Button = React.createClass({
  render() {
    return <button {...this.props} type="button">
      {this.props.children}
    </button>;
  }
});

Button = addClass(Button, 'btn btn-default');
Button.Primary = addClass(Button, 'btn btn-primary');
Button.Info = addClass(Button, 'btn btn-info');
Button.Success = addClass(Button, 'btn btn-success');
Button.Warning = addClass(Button, 'btn btn-warning');
Button.Danger = addClass(Button, 'btn btn-danger');

export default Button;