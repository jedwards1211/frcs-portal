'use strict';

import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';

export default React.createClass({
  displayName: 'BlockContent',
  propTypes: {
    colSpan: React.PropTypes.number.isRequired,
    rowSpan: React.PropTypes.number.isRequired,
  },
  shouldComponentUpdate() {
    return false;
  },
  onResize(...args) {
    var content = this.refs.content;
    content.onResize && content.onResize(...args);
  },
  render() {
    var {className, rowSpan, colSpan, ...props} = this.props;
    className = classNames('content', className);

    return (
      <div key="content" className={className} {...props}>
        {this.props.children}
      </div>
    );
  }
});