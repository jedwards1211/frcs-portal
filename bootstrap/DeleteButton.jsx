import React, {Component} from 'react';
import classNames from 'classnames';

import Button from './Button.jsx';
import Spinner from '../common/Spinner';

export default class DeleteButton extends Component {
  static propTypes = {
    armedText:    React.PropTypes.string,
    disarmedText: React.PropTypes.string,
    deletingText: React.PropTypes.string,
    onArmedClick: React.PropTypes.func,
    deleting:     React.PropTypes.bool,
  };
  static defaultProps = {
    armedText:    'Are you sure?',
    disarmedText: '',
    deletingText: '',
  };
  constructor(props) {
    super(props);
    this.state = {armed: false};
  }
  onBlur = (e) => {
    this.setState({armed: false});
    if (this.props.onBlur) this.props.onBlur(e);
  };
  onClick = (e) => {
    if (this.state.armed) {
      if (this.props.onArmedClick) this.props.onArmedClick(e);
    }
    else {
      this.setState({armed: true});
    }
    if (this.props.onClick) this.props.onClick(e);
  };
  render() {
    let {className, deleting, deletingText, disabled} = this.props;
    let {armed} = this.state;
    let {armedText, disarmedText} = this.props;
    className = classNames(className, 'btn', 'delete-btn');

    return <Button {...this.props} danger={armed} className={className}
      onBlur={this.onBlur} onClick={this.onClick} disabled={disabled || deleting}>
      {deleting ? 
        <span><Spinner/> {deletingText}</span>
        :
        <span><i className="glyphicon glyphicon-trash"/> {armed ? armedText : disarmedText}</span>
      }
    </Button>;
  }
}