import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';

import Dropdown from '../bootstrap/Dropdown';

import './ComboBox.sass';

export default class ComboBox extends Component {
  static propTypes = {
    items:              PropTypes.arrayOf(PropTypes.any.isRequired),
    selectedItem:       PropTypes.any,
    placeholder:        PropTypes.any,
    noItemsPlaceholder: PropTypes.any,
    render:             PropTypes.func,
    renderSelectedItem: PropTypes.func,
    onChange:           PropTypes.func,
    disabled:           PropTypes.bool,
    toggleButtonClassName: PropTypes.string,
  };
  static defaultProps = {
    render: item => String(item),
    placeholder: 'Select Item',
    noItemsPlaceholder: 'No Items Available',
    component: 'div',
    onChange: function() {},
    toggleButtonClassName: 'form-control',
  };
  render() {
    let {items, selectedItem, render: renderItem, renderSelectedItem, placeholder, noItemsPlaceholder,
        onChange, disabled, className, toggleButtonClassName} = this.props;

    let noSelection = selectedItem === undefined || selectedItem === null;
    let hasItems = items && items.length;

    className = classNames(className, 'mf-combo-box', {'no-selection': noSelection});
    toggleButtonClassName = classNames(toggleButtonClassName, 'btn btn-default');

    return <Dropdown {...this.props} className={className}>
      <Dropdown.Toggle component="button" type="button" className={toggleButtonClassName}
        disabled={disabled || !hasItems}>
        <span ref={c => this.selectedItem = c} className="selected-item">
          {renderSelectedItem(noSelection ? 
            (hasItems ? placeholder : noItemsPlaceholder)
            : 
            selectedItem)}
        </span> <span className="caret"/>
      </Dropdown.Toggle>
      {hasItems && <Dropdown.Menu component="ul" ref={c => this.dropdownMenu = c}>
        {items.map((item, index) => (<li key={index} onClick={() => onChange(item, index)}>
          <a>{renderItem(item)}</a>
        </li>))}
      </Dropdown.Menu>}
    </Dropdown>;
  }
}
