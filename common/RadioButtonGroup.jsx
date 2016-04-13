/* @flow */

import React, {Component, Children} from 'react';
import classNames from 'classnames';

import type {Key} from '../flowtypes/commonTypes';

import ButtonGroup from '../bootstrap/ButtonGroup.jsx';

type Props = {
  value?: Key,
  onChange?: (value: Key) => any,
  children?: mixed
};

export default class RadioButtonGroup extends Component<void,Props,void> {
  static supportsInputGroupBtn = true;
  render(): React.Element {
    let {value, children, onChange} = this.props;
    return <ButtonGroup {...this.props}>
      {Children.map(children, (child: mixed) => {
        if (!(child instanceof Object) || !(child.props instanceof Object)) return child;
        let {props: {className, value: childValue}} = child;
        if (childValue === value) className = classNames(className, 'active');
        return React.cloneElement(child, {
          className,
          onClick: () => onChange && onChange(childValue)
        });
      })}
    </ButtonGroup>;
  } 
}
