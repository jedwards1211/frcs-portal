/* @flow */

import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';

import Dropdown from './Dropdown.jsx';

import {getSizingClass} from './bootstrapPropUtils';

type Props = {
  children?: any,
  component?: any,
  dropup?: boolean,
  dropdown?: boolean,
  className?: string,
  sm?: boolean,
  small?: boolean,
  lg?: boolean,
  large?: boolean,
  xs?: boolean,
  extraSmall?: boolean,
  sizing?: 'sm' | 'small' | 'lg' | 'large' | 'xs' | 'extraSmall',
  vertical?: boolean,
  justified?: boolean,
};

export default class ButtonGroup extends Component<void,Props,void> {
  static contextTypes = {
    insideFormGroup: PropTypes.bool,
    insideButtonGroup: PropTypes.bool,
    sizing: PropTypes.string
  };
  static childContextTypes = {
    insideButtonGroup: PropTypes.bool,
    sizing: PropTypes.string
  };
  getChildContext(): Object {
    return {
      insideButtonGroup: true,
      sizing: getSizingClass(this.props)
    };
  }
  render(): ReactElement {
    let {className, vertical, justified, dropup, dropdown} = this.props;
    let {insideFormGroup, insideButtonGroup} = this.context;
    let sizingClass = getSizingClass(this.props) || this.context.sizing;
    className = classNames(className, sizingClass && 'btn-group-' + sizingClass, {
      'btn-group': !vertical,
      'btn-group-vertical': vertical,
      'btn-group-justified': justified,
      'form-control': insideFormGroup && !insideButtonGroup
    });

    if (insideButtonGroup || dropup || dropdown) {
      return <Dropdown component="div" role="group" {...this.props} className={className}/>;
    }

    let Comp: any = this.props.component || 'div';

    return <Comp role="group" {...this.props} className={className}/>;
  }
}
