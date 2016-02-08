import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';

export default props => {
  let className = classNames(props.className, 'glyphicon', _.map(props,
    (val, prop) => prop && 'glyphicon-' + _.kebabCase(prop)));
  return <i className={className}/>;
};