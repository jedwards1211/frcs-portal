/* @flow */

import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import {createSkinComponent} from 'react-skin';
import {Header, Title, Body, Footer} from './Content.jsx';
import Collapse from './Collapse';
import {getContextClass, getContextContent} from './bootstrapPropUtils';
import {errorMessage} from '../utils/reactErrorUtils';

const PanelHeaderSkin = createSkinComponent('BootstrapPanelHeader', {component: 'div', className: 'panel-heading'});
const PanelTitleSkin  = createSkinComponent('BootstrapPanelTitle' , {component: 'h3' , className: 'panel-title' });
const PanelFooterSkin = createSkinComponent('BootstrapPanelFooter', {component: 'div', className: 'panel-footer'});
class PanelBodySkin extends Component {
  render() {
    let {className, collapse, children} = this.props;
    className = classNames(className, 'panel-body');
    let result = <div {...this.props} className={className}>
      {children}
    </div>;
    if (collapse) {
      result = <Collapse {...this.props} className="panel-collapse">{result}</Collapse>;
    }
    return result;
  }
}

type Props = {
  type?: 'alarm' | 'error' | 'danger' | 'warning' | 'info' | 'success' | 'ok' | 'primary',
  alarm?: any,
  error?: any,
  danger?: any,
  warning?: any,
  info?: any,
  success?: any,
  ok?: any,
  primary?: any,
  className?: string,
  children?: any,
  title?: any,
  header?: any,
  headerProps?: Object,
  footer?: any,
  collapse?: boolean,
  collapseProps?: Object,
  open?: boolean,
  onTransitionEnd?: Function,
  skin?: boolean,
};

export default class Panel extends Component {
  props: Props;
  static defaultProps: {};
  static childContextTypes = {
    HeaderSkin: PropTypes.any.isRequired,
    TitleSkin:  PropTypes.any.isRequired,
    BodySkin:   PropTypes.any.isRequired,
    FooterSkin: PropTypes.any.isRequired,
  };
  getChildContext() {
    return {
      HeaderSkin: PanelHeaderSkin,
      TitleSkin:  PanelTitleSkin,
      BodySkin:   PanelBodySkin,
      FooterSkin: PanelFooterSkin,
    };
  }
  render()/*: ReactElement<any,any,any> */ {
    let {className, children, header, headerProps, title, footer, collapse, skin} = this.props;
    let contextClass = getContextClass(this.props) || 'default';
    let content = getContextContent(this.props);

    if (content && (contextClass === 'danger' || contextClass === 'warning' || content instanceof Error)) {
      content = errorMessage(content);
    }

    className = classNames(className, 'panel', 'panel-' + contextClass);

    if (skin) {
      return <div {...this.props} className={className}>
        {children}
      </div>;
    }

    let bodyProps = {};
    if (collapse) {
      let {collapseProps, open, onTransitionEnd} = this.props;
      bodyProps = {
        collapse: true,
        ...(collapseProps || {}),
        open,
        onTransitionEnd,
      };
    }

    let body = (content || children) && <Body {...bodyProps}>
      {content}
      {children}
    </Body>;

    return <div {...this.props} className={className}>
      {(header || title) && <Header {...(headerProps || {})}>
        {title && <Title>{title}</Title>}
        {header}
      </Header>}
      {body}
      {footer && <Footer>{footer}</Footer>}
    </div>;
  }
}
