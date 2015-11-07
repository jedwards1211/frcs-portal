import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import _ from 'lodash';

class DropdownToggle extends Component {
  static propTypes = {
    open:      React.PropTypes.bool,
    component: React.PropTypes.any.isRequired,
  }
  render() {
    var {component, open, children, className, ...props} = this.props;
    props['aria-haspopup'] = 'true';
    props['aria-expanded'] = open;
    props.className = classNames('dropdown-toggle', className);
    return React.createElement(component, props, children);
  }
}

class DropdownMenu extends Component {
  static propTypes = {
    component: React.PropTypes.any.isRequired,
  }
  render() {
    var {component, children, className, ...props} = this.props;
    props.className = classNames('dropdown-menu', className);
    return React.createElement(component, props, children);
  }
}

class Dropdown extends Component {
  static propTypes = {
    /*
     * optional (overrides state.open if used)
     */
    open:               React.PropTypes.bool,
    closeOnInsideClick: React.PropTypes.bool,
    component:          React.PropTypes.any.isRequired,
    dropup:             React.PropTypes.any,
  }
  static defaultProps = {
    closeOnInsideClick: true,
  }
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }
  show() {
    this.setState({open: true});
  }
  hide() {
    this.setState({open: false});
  }
  onDropdownToggleClick = () => {
    this.setState({open: !this.state.open});
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.open !== undefined && nextProps.open === undefined) {
      this.setState({open: this.props.open});
    }
  }
  componentDidUpdate() {
    if (this.state.open && !this.isDocumentClickInstalled) {
      document.addEventListener('click', this.onDocumentClick, true);
      this.isDocumentClickInstalled = true;
    }
    else if (!this.state.open && this.isDocumentClickInstalled) {
      document.removeEventListener('click', this.onDocumentClick, true);
      this.isDocumentClickInstalled = false;
    }
  }
  componentWillUnmount() {
    if (this.isDocumentClickInstalled) {
      document.removeEventListener('click', this.onDocumentClick, true);
      this.isDocumentClickInstalled = false;
    }
  }
  onDocumentClick = (e) => {
    function isDescendant(el, ancestor) {
      while (el && el !== document.body.parentElement) {
        if (el === ancestor) {
          return true;
        }
        el = el.parentElement;
      }
      return false;
    }

    if (this.props.closeOnInsideClick || 
      (!isDescendant(e.target, ReactDOM.findDOMNode(this.refs.menu))) &&
      (!isDescendant(e.target, ReactDOM.findDOMNode(this.refs.toggle)))) {
      this.setState({open: false});
    }
  }
  render() {
    var {className, component, openClassName, children} = this.props;
    var open = this.props.open !== undefined ? this.props.open : this.state.open;
    var props = _.clone(this.props);

    let type = this.props.hasOwnProperty('dropup') ? 'dropup' : 'dropdown';

    props.className = classNames(className, type, {open: open}, openClassName && {openClassName: open});
    props.ref = 'dropdown';

    children = React.Children.map(children, child => {
      if (child) {
        if (child.type === DropdownToggle) {
          var onClick = child.props.onClick ? 
            () => {
              child.props.onClick();
              this.onDropdownToggleClick();
            } 
            : 
            this.onDropdownToggleClick;

          return React.cloneElement(child, {ref: 'toggle', open, onClick});
        }
        if (child.type === DropdownMenu) {
          return React.cloneElement(child, {ref: 'menu'});
        }
      }
      return child;
    });

    return React.createElement(component, props, children);
  }
}

Dropdown.Toggle = DropdownToggle;
Dropdown.Menu = DropdownMenu;

export default Dropdown;

export { Dropdown, DropdownMenu , DropdownToggle };
