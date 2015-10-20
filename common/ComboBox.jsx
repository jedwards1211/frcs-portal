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
    onChange:           PropTypes.func,
    disabled:           PropTypes.bool,
  }
  static defaultProps = {
    render: item => String(item),
    placeholder: 'Select Item',
    noItemsPlaceholder: 'No Items Available',
    component: 'div',
    onChange: function() {},
  }
  render() {
    let {items, selectedItem, render, placeholder,
        noItemsPlaceholder, onChange, disabled, className} = this.props;

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
        {items.map((item, index) => (<li key={index} onClick={() => onChange(item, index)}>
          <a>{render(item)}</a>
        </li>))}
      </Dropdown.Menu>}
    </Dropdown>;
  }
}
