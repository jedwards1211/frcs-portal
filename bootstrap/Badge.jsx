/* @flow */

import React from 'react';
import classNames from 'classnames';

export default (props: Object): ReactElement => {
  let {className} = props;
  className = classNames(className, 'badge');
  return <span {...props} className={className}/>;
};
