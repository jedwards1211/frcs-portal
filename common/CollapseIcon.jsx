import React from 'react';
import classNames from 'classnames';

import './CollapseIcon.sass';

export default class CollapseIcon extends React.Component {
  static propTypes = {
    open: React.PropTypes.bool,
  }
  render() {
    let {open} = this.props;
    let className = classNames('glyphicon glyphicon-play collapse-icon', {open});
    return <i className={className}/>;
  }
}