/* @flow */

import React, {Component, Children, PropTypes} from 'react';
import classNames from 'classnames';
import {getContextClass, getShadeClass} from './bootstrapPropUtils';
import {Title, Body} from './Content.jsx';
import {getSide} from '../utils/propUtils';
import {createSkinComponent} from 'react-skin';
import Collapse from './Collapse.jsx';

import './Popover.sass';

const PopoverHeaderSkin = createSkinComponent('BootstrapPopoverHeader', {component: 'div', className: 'popover-header'});
const PopoverTitleSkin  = createSkinComponent('BootstrapPopoverTitle' , {component: 'h3',  className: 'popover-title'});
const PopoverFooterSkin = createSkinComponent('BootstrapPopoverFooter', {component: 'div', className: 'panel-footer'});
class PopoverBodySkin extends Component {
  render() {
    let {className, collapse, children} = this.props;
    className = classNames(className, 'popover-content');
    let result = <div {...this.props} className={className}>
      {children}
    </div>;
    if (collapse) {
      result = <Collapse {...this.props} className="popover-collapse">{result}</Collapse>;
    }
    return result;
  }
}

type Props = {
  title?: any,
  side?: 'top' | 'left' | 'bottom' | 'right',
  top?: boolean,
  left?: boolean,
  bottom?: boolean,
  right?: boolean,
  contextClass?: 'danger' | 'alarm' | 'error' | 'warning' | 'info' | 'success',
  danger?: boolean,
  alarm?: boolean,
  error?: boolean,
  warning?: boolean,
  info?: boolean,
  success?: boolean,
  shade?: 'darker' | 'brighter',
  darker?: boolean,
  brighter?: boolean,
  className?: string,
  children?: any,
  skin?: boolean,
  positioned?: boolean,
}

export default class Popover extends Component {
  props: Props;
  static defaultProps: {};
  static childContextTypes = {
    ContainerSkin:  PropTypes.any.isRequired,
    HeaderSkin:     PropTypes.any.isRequired,
    TitleSkin:      PropTypes.any.isRequired,
    BodySkin:       PropTypes.any.isRequired,
    FooterSkin:     PropTypes.any.isRequired,
  };
  getChildContext(): Object {
    return {
      ContainerSkin:  Popover,
      HeaderSkin:     PopoverHeaderSkin,
      TitleSkin:      PopoverTitleSkin,
      BodySkin:       PopoverBodySkin,
      FooterSkin:     PopoverFooterSkin,
    };
  }
  render(): ReactElement {
    let {className, title, children, positioned, skin} = this.props;

    let side = getSide(this.props) || 'top';
    let contextClass = getContextClass(this.props);
    let shadeClass = getShadeClass(this.props);

    let contentless = !Children.count(children);
    if (skin) {
      Children.forEach(children, child => {
        if (child.type === Body) {
          contentless = (child.props.collapse && !child.props.open) || !Children.count(child.props.children);
        }
      });
    }

    className = classNames(className, 'popover', side, shadeClass, contextClass && ('popover-' + contextClass), {
      'popover-contentless': contentless,
      'popover-positioned': positioned,
    });


    if (skin) {
      return <div {...this.props} className={className}>
        <div className="arrow"/>
        {children}
      </div>;
    }
    return <div {...this.props} className={className}>
      <div className="arrow"/>
      {title && <Title>{title}</Title>}
      <Body>
        {children}
      </Body>
    </div>;
  }
}
