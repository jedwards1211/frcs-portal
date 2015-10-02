import React from 'react';

export default (props) => (<button {...props} type="button" className="close" aria-label="Close">
  <span aria-hidden="true">&times;</span>
</button>);
