import React, {Component} from 'react';
import classNames from 'classnames';

import './DeleteBlockButton.sass';

export default class DeleteBlockButton extends Component {
  render() {
    var {className} = this.props;
    className = classNames('delete-block-btn', className);

    return <button type="button" {...this.props} className={className}
      onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
      <i className="glyphicon glyphicon-remove" />
    </button>;
  } 
}
