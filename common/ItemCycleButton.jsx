import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';

import Button from '../bootstrap/Button';

export default class ItemCycleButton extends Component {
  static propTypes = {
    items:              PropTypes.arrayOf(PropTypes.any.isRequired),
    selectedItem:       PropTypes.any,
    placeholder:        PropTypes.any,
    noItemsPlaceholder: PropTypes.any,
    render:             PropTypes.func,
    onSelect:           PropTypes.func,
    disabled:           PropTypes.bool,
  }
  static defaultProps = {
    render: item => String(item),
    placeholder: 'Select Item',
    noItemsPlaceholder: 'No Items Available',
  }
  onClick = () => {
    let {items, selectedItem, onSelect} = this.props;
    if (items && onSelect) {
      let index = items.indexOf(selectedItem);
      onSelect(items[(index + 1) % items.length]);
    }
  }
  render() {
    let {items, selectedItem, render, placeholder,
        noItemsPlaceholder, className} = this.props;

    let noSelection = selectedItem === undefined || selectedItem === null;
    let hasItems = items && items.length;

    className = classNames(className, 'mf-item-cycle-btn', {'no-selection': noSelection});

    return <Button {...this.props} className={className} onClick={this.onClick}>
      {render(noSelection ? 
        (hasItems ? placeholder : noItemsPlaceholder)
        : 
        selectedItem)}
    </Button>;
  }
}
