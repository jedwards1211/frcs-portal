import React from 'react';

import './CloseButton.sass';

export default (props) => (<button {...props}
  onClick={props.disabled ? undefined : props.onClick}
  type="button" className="close" aria-label="Close">
  <span aria-hidden="true">&times;</span>
</button>);
