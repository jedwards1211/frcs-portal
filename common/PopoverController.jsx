import React, {Component, PropTypes, Children} from 'react';
import classNames from 'classnames';

import './PopoverController.sass';

export default class PopoverController extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    dataPopover:  PropTypes.node.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {};
  }
  onMouseEnter = () => {
    this.setState({hovered: true});
  }
  onMouseLeave = () => {
    this.setState({hovered: false});
  }
  onClick = () => {
    this.setState({toggled: true}); 
  }
  onBlur = () => {
    this.setState({toggled: false});
  }
  render() {
    let {children, dataPopover: popover} = this.props; 
    let {onMouseEnter, onMouseLeave, onClick, onBlur} = this;
    let {hovered, toggled} = this.state;

    let child = Children.only(children);

    let childProps = {
      onMouseEnter, onMouseLeave, onClick, onBlur,
      tabIndex: child.props.tabIndex || 0,
    };

    if (hovered || toggled) {
      childProps.className = classNames(child.props.className, 'mf-has-auto-popover');
      childProps.children = Children.toArray(child.props.children);
      console.log(childProps.children);
      childProps.children.push(React.cloneElement(popover, {key: children.length}));
    }

    return React.cloneElement(child, childProps);
  }
}
