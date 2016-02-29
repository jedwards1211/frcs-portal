/* @flow */

import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';

type Props = {
  className?: string,
  component?: ReactTag,
  children?: any
};

export default class ButtonToolbar extends Component<void,Props,void> {
  static contextTypes = {
    insideFormGroup: PropTypes.bool
  };
  render(): ReactElement {
    let {className} = this.props;
    let {insideFormGroup} = this.context;
    className = classNames(className, 'btn-toolbar', {
      'form-control': insideFormGroup
    });
    let Comp: any = this.props.component || 'div';
    return <Comp role="toolbar" {...this.props} className={className}/>;
  }
}
