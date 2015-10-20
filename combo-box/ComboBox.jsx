import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';

import Dropdown from '../bootstrap/Dropdown';

import './ComboBox.sass';

export default class ComboBox extends Component {
  static propTypes = {
    items:              PropTypes.arrayOf(PropTypes.any.isRequired),
    selectedItem:       PropTypes.any,
    placeholder:        PropTypes.string,
    noItemsPlaceholder: PropTypes.string,
    getKey:             PropTypes.func,
    render:             PropTypes.func,
    onSelect:           PropTypes.func,
    disabled:           PropTypes.bool,
  }
  static defaultProps = {
    getKey: item => String(item),
    render: item => String(item),
    placeholder: 'Select Item',
    noItemsPlaceholder: 'No Items Available',
    component: 'div',
    onSelect: function() {},
  }
  render() {
    let {items, selectedItem, getKey, render, placeholder,
        noItemsPlaceholder, onSelect, disabled, className} = this.props;

    let noSelection = selectedItem === undefined || selectedItem === null;
    let hasItems = items && items.length;

    className = classNames(className, 'mf-combo-box', {'no-selection': noSelection});

    return <Dropdown {...this.props} className={className}>
      <Dropdown.Toggle component="button" type="button" className="form-control btn btn-default" 
        disabled={disabled || !hasItems}>
        <span className="selected-item">
          {render(noSelection ? 
            (hasItems ? placeholder : noItemsPlaceholder)
            : 
            selectedItem)}
        </span> <span className="caret"/>
      </Dropdown.Toggle>
      {hasItems && <Dropdown.Menu component="ul">
        {items.map(item => (<li key={getKey(item)} onClick={() => onSelect(item)}>
          <a>{render(item)}</a>
        </li>))}
      </Dropdown.Menu>}
    </Dropdown>;
  }
}
