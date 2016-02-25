/* @flow */

import React, {Component, PropTypes, Children} from 'react';
import classNames from 'classnames';

import Badge from './Badge.jsx';
import {getContextClass} from './bootstrapPropUtils';

import {Title, Body} from '../common/View.jsx';

type Props = {
  component: any,
  className?: string,
  children?: any,
};

export default class ListGroup extends Component<void,Props,void> {
  static childContextTypes = {
    TitleSkin: PropTypes.any.isRequired,
    TitleClassName: PropTypes.string.isRequired,
    BodyClassName: PropTypes.string.isRequired,
  };
  getChildContext(): Object {
    return {
      TitleSkin: 'h4',
      TitleClassName: "list-group-item-heading",
      BodyClassName: "list-group-item-text"
    };
  }
  cloneChild: (child: ?ReactElement) => ?ReactElement = child => {
    if (!child) {
      return child;
    }
    let {className, children, title, active, disabled, badge} = child.props;

    let contextClass = getContextClass(child.props);
    className = classNames(className, 'list-group-item',
      contextClass && 'list-group-item-' + contextClass, {active, disabled});

    if (title) {
      children = [
        <Title key="title">{title}</Title>,
        <Body key="body">{children}</Body>
      ];
    }
    if (badge) {
      children = [
        <Badge key="badge">{badge}</Badge>,
        ...Children.toArray(children)
      ];
    }
    return React.cloneElement(child, {className, children});
  };
  render(): ReactElement {
    let {className, children} = this.props;

    let Comp = this.props.component || 'div';
    className = classNames(className, 'list-group');

    return <Comp {...this.props} className={className}>
      {Children.map(children, this.cloneChild)}
    </Comp>;
  }
}
