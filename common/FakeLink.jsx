/* @flow */

import React, {Component, PropTypes} from 'react';
import safeCloneElement from '../utils/safeCloneElement';

type Props = {
  onClick?: Function,
  to?: string | {pathname: string, query: Object},
  children?: any
};

export default class FakeLink extends Component<void,Props,void> {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };
  onClick: Function = () => {
    let {to} = this.props;
    if (to) this.context.router.push(to);
  };
  render(): React.Element {
    return this.props.children ? safeCloneElement(this.props.children, {
      onClick: this.onClick,
      style: {
        cursor: 'pointer'
      }
    }) : 
      <span {...this.props}/>;
  } 
}
