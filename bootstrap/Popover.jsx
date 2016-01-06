import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';

export default class Popover extends Component {
  static propTypes = {
    title: PropTypes.node,
    side:  PropTypes.oneOf(['top', 'left', 'bottom', 'right'])
  }
  static defaultProps = {
    side: 'top'
  }
  render() {
    let {className, side, title, children} = this.props;

    className = classNames(className, 'popover', side);

    return <div {...this.props} className={className}>
      <div className="arrow"/>
      {title && <h3 className="popover-title">{title}</h3>}
      <div className="popover-content">
        {children}
      </div>
    </div>;
  }
}
