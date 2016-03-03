import React, {Component, Children} from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import _ from 'lodash';

class DropdownToggle extends Component {
  static propTypes = {
    open:      React.PropTypes.bool,
  };
  render() {
    var {open, children, className} = this.props;
    className = classNames('dropdown-toggle', className);

    return React.cloneElement(children, {
      ...this.props,
      children: children.props.children,
      className,
      'aria-haspopup': true,
      'aria-expanded': open
    });
  }
}

class DropdownMenu extends Component {
  render() {
    let {children: component, className} = this.props;
    className = classNames('dropdown-menu', className, component.props.className);
    return React.cloneElement(component, {...this.props, className}, component.props.children);
  }
}

/**
 * Wrapper for Bootstrap dropdown menus.
 * The last child will be rendered as the .dropdown-menu,
 * and the next-to-last child as the .dropdown-toggle.
 * Preceeding children will be rendered next to the toggle, so that
 * e.g. split buttons work.
 *
 * Magic properties of .dropdown-menu children:
 * * divider - clones the child with role="separator" and .divider class
 */
class Dropdown extends Component {
  static supportsInputGroupBtn = true;
  static propTypes = {
    /*
     * optional (overrides state.open if used)
     */
    open:               React.PropTypes.bool,
    closeOnInsideClick: React.PropTypes.bool,
    disabled:           React.PropTypes.bool,
    component:          React.PropTypes.any.isRequired,
    dropup:             React.PropTypes.any,
    onOpened:           React.PropTypes.func,
    onClosed:           React.PropTypes.func,
  };
  static defaultProps = {
    closeOnInsideClick: true,
  };
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }
  show() {
    this.setState({open: true});
  }
  open() {
    this.setState({open: true});
  }
  hide() {
    this.setState({open: false});
  }
  close() {
    this.setState({open: false});
  }
  onDropdownToggleClick = () => {
    this.setState({open: !this.state.open});
  };
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

    if (this.justOpened && this.props.onOpened) {
      this.props.onOpened();
    }
    if (this.justClosed && this.props.onClosed) {
      this.props.onClosed();
    }
  }
  componentWillUnmount() {
    if (this.isDocumentClickInstalled) {
      document.removeEventListener('click', this.onDocumentClick, true);
      this.isDocumentClickInstalled = false;
    }
  }
  componentWillUpdate(nextProps, nextState) {
    let open = this.props.open !== undefined ? this.props.open : this.state.open;
    let nextOpen = nextProps.open !== undefined ? nextProps.open : nextState.open;
    this.justOpened = !open && nextOpen;
    this.justClosed = open && !nextOpen;
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
      (!isDescendant(e.target, ReactDOM.findDOMNode(this.menu))) &&
      (!isDescendant(e.target, ReactDOM.findDOMNode(this.toggle)))) {
      this.setState({open: false});
    }
  };
  render() {
    var {className, dropup, component, openClassName, children, disabled} = this.props;
    var open = this.props.open !== undefined ? this.props.open : this.state.open;
    var props = _.clone(this.props);

    let type = dropup ? 'dropup' : 'dropdown';

    props.className = classNames(className, type, {open: open}, openClassName && {openClassName: open});
    props.ref = 'dropdown';

    children = Children.toArray(children);

    if (!children.find(child => child.type === DropdownToggle)) {
      let count = children.length;
      children = [
        ...children.slice(0, count - 2),
        <DropdownToggle key="dropdown-toggle" {...children[count - 2].props} disabled={disabled}>
          {children[count - 2]}
        </DropdownToggle>,
        <DropdownMenu   key="dropdown-menu"   {...children[count - 1].props} disabled={disabled}>
          {children[count - 1]}
        </DropdownMenu>
      ];
    }

    children = children.map(child => {
      if (child) {
        if (child.type === DropdownToggle) {
          var onClick = () => {
            if (child.props.onClick) child.props.onClick();
            if (!disabled) this.onDropdownToggleClick();
          };

          let origRef = child.ref;
          return React.cloneElement(child, {
            ref: c => {
              if (origRef) origRef(c);
              this.toggle = c;
            }, 
            open, onClick
          });
        }
        if (child.type === DropdownMenu) {
          let origRef = child.ref;
          return React.cloneElement(child, {ref: c => {
            if (origRef) origRef(c);
            this.menu = c; 
          }});
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
