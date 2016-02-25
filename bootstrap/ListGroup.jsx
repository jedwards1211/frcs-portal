/* @flow */

import React, {Component, PropTypes, Children} from 'react';
import classNames from 'classnames';

import Badge from './Badge.jsx';
import {getContextClass} from './bootstrapPropUtils';

import {Header, Title, Body} from '../common/View.jsx';

type DefaultProps = {
  component: ReactTag
};

type Props = {
  component: ReactTag,
  className?: string,
  children?: any,
};

/**
 * A super-convenient way to create Bootstrap list groups.  Children can be any type of element you want,
 * and you can give them the following additional props (the children will be cloned with additional classNames
 * and children based upon what props you specify):
 *
 * * contextClass - bootstrap context class (danger/alarm/error/warning/success/ok/info)
 * * danger(/alarm/error) - use .list-group-item-danger context class
 * * warning - use .list-group-item-warning context class
 * * success(/ok) - use .list-group-item-success context class
 * * info - use .list-group-item-info context class
 * * active - use .active class
 * * disabled - use .disabled class
 * * badge - add a badge to the list item
 * * header - add a <Header> (will get .list-group-item-heading class)
 * * title - add a <Title> (inside a default <Header> if not given)
 *
 * In addition, you may use the usual View, Header, Title, and Body skinnable components inside children,
 * and they will be rendered using the correct bootstrap classes.
 *
 * The root component will default to 'div'.  You may override it by passing a `component` prop.
 */
export default class ListGroup extends Component<DefaultProps,Props,void> {
  static defaultProps = {
    component: 'div'
  };
  static childContextTypes = {
    TitleSkin: PropTypes.any.isRequired,
    TitleClassName: PropTypes.string.isRequired,
    HeaderSkin: PropTypes.any.isRequired,
    HeaderClassName: PropTypes.string.isRequired,
    BodyClassName: PropTypes.string.isRequired,
  };
  getChildContext(): Object {
    return {
      TitleSkin: 'div',
      TitleClassName: "list-group-item-title",
      HeaderSkin: 'h4',
      HeaderClassName: "list-group-item-heading",
      BodyClassName: "list-group-item-text"
    };
  }
  cloneChild: (child: ?ReactElement) => ?ReactElement = child => {
    if (!child) {
      return child;
    }
    let {className, children, header, title, active, disabled, badge} = child.props;

    let contextClass = getContextClass(child.props);
    className = classNames(className, 'list-group-item',
      contextClass && 'list-group-item-' + contextClass, {active, disabled});

    if (title) {
      if (header instanceof Array) {
        header = [
          <Title key="title">{title}</Title>,
          ...header
        ];
      }
      else if (header) {
        header = [
          <Title key="title">{title}</Title>,
          header
        ];
      }
      else {
        header = <Title>{title}</Title>;
      }
    }
    if (header) {
      children = [
        <Header key="header">{header}</Header>,
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

    // any -- because the flow def for createElement is currently wrong
    let Comp: any = this.props.component;
    className = classNames(className, 'list-group');

    return <Comp {...this.props} className={className}>
      {Children.map(children, this.cloneChild)}
    </Comp>;
  }
}
