/* @flow */

import React, {Component} from 'react';
import classNames from 'classnames';

type Props = {
  className?: string,
  component?: ReactTag,
  children?: any
};

export default class ButtonToolbar extends Component<void,Props,void> {
  render(): ReactElement {
    let {className} = this.props;
    className = classNames(className, 'btn-toolbar');
    let Comp: any = this.props.component || 'div';
    return <Comp role="toolbar" {...this.props} className={className}/>;
  }
}
