import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import {createSkinnableComponent} from 'react-skin';

import './View.sass';

const ViewProps = {
  defaultComponent: 'div',
  defaultClassName: 'mf-default-view',
  className:        'skinnable-view',
};
export const View = createSkinnableComponent('View', ViewProps);

const HeaderProps = {
  defaultComponent: 'div',
  defaultClassName: 'mf-default-header',
  className:        'skinnable-header',
};
export const Header = createSkinnableComponent('Header', HeaderProps);

const TitleProps = {
  defaultComponent: 'h3',
  defaultClassName: 'mf-default-title',
  className:        'skinnable-title',
};
export const Title  = createSkinnableComponent('Title', TitleProps);

const FooterProps = {
  defaultComponent: 'div',
  defaultClassName: 'mf-default-footer',
  className:        'skinnable-footer',
};
export const Footer = createSkinnableComponent('Footer', FooterProps);

const BodyProps = {
  defaultComponent: 'div',
  defaultClassName: 'mf-default-body',
  className:        'skinnable-body',
};
export class Body extends Component {
  static contextTypes = {
    BodySkin: PropTypes.any,
    BodyClassName: PropTypes.string,
  };
  static childContextTypes = {
    ViewSkin: PropTypes.any.isRequired,
    ViewClassName: PropTypes.string.isRequired,
    HeaderSkin: PropTypes.any.isRequired,
    HeaderClassName: PropTypes.string.isRequired,
    TitleSkin: PropTypes.any.isRequired,
    TitleClassName: PropTypes.string.isRequired,
    BodySkin: PropTypes.any.isRequired,
    BodyClassName: PropTypes.string.isRequired,
    FooterSkin: PropTypes.any.isRequired,
    FooterClassName: PropTypes.string.isRequired,
  };
  getChildContext() {
    return {
      ViewSkin: ViewProps.defaultComponent,
      ViewClassName: ViewProps.defaultClassName,
      HeaderSkin: HeaderProps.defaultComponent,
      HeaderClassName: HeaderProps.defaultClassName,
      TitleSkin: TitleProps.defaultComponent,
      TitleClassName: TitleProps.defaultClassName,
      BodySkin: BodyProps.defaultComponent,
      BodyClassName: BodyProps.defaultClassName,
      FooterSkin: FooterProps.defaultComponent,
      FooterClassName: FooterProps.defaultClassName,
    };
  }
  render() {
    let Comp = this.context.BodySkin || BodyProps.defaultComponent;
    let className = classNames(BodyProps.className, this.props.className,
      this.context.BodyClassName || BodyProps.defaultClassName);
    return <Comp {...this.props} className={className}>{this.props.children}</Comp>;
  }
}

export const Link   = createSkinnableComponent('Link', {
  defaultComponent: 'a',
});
