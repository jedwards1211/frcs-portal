import React, {Component} from 'react';
import classNames from 'classnames';

export default class DeleteButton extends Component {
  static propTypes = {
    armedText:    React.PropTypes.string,
    disarmedText: React.PropTypes.string,
    onArmedClick: React.PropTypes.func,
  }
  static defaultProps = {
    armedText:    'Are you sure?',
    disarmedText: '',
  }
  constructor(props) {
    super(props);
    this.state = {armed: false};
  }
  onBlur = (e) => {
    this.setState({armed: false});
    if (this.props.onBlur) this.props.onBlur(e);
  }
  onClick = (e) => {
    if (this.state.armed) {
      if (this.props.onArmedClick) this.props.onArmedClick(e);
    }
    else {
      this.setState({armed: true});
    }
    if (this.props.onClick) this.props.onClick(e);
  }
  render() {
    let {className} = this.props;
    let {armed} = this.state;
    let {armedText, disarmedText} = this.props;
    className = classNames(className, 'btn', {'btn-default': !armed, 'btn-danger': armed});

    return <button type="button" {...this.props} className={className} 
      onBlur={this.onBlur} onClick={this.onClick}>
      <i className="glyphicon glyphicon-trash"/> {armed ? armedText : disarmedText}
    </button>;
  }
}