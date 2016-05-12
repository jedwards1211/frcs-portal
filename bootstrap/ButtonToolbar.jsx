/* @flow */

import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';

import './ButtonToolbar.sass';

type Props = {
  className?: string,
  component?: any,
  children?: any
};

export default class ButtonToolbar extends Component<void,Props,void> {
  static contextTypes = {
    insideFormGroup: PropTypes.bool
  };
  static childContextTypes = {
    insideButtonToolbar: PropTypes.bool
  };
  getChildContext(): Object {
    return {
      insideButtonToolbar: true
    };
  }
  render(): React.Element {
    let {className} = this.props;
    let {insideFormGroup} = this.context;
    className = classNames(className, 'btn-toolbar', {
      'form-control': insideFormGroup
    });
    let Comp: any = this.props.component || 'div';
    return <Comp role="toolbar" {...this.props} className={className}/>;
  }
}
