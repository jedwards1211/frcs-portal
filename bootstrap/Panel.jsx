/* @flow */

import React, {Component, PropTypes, Children} from 'react';
import classNames from 'classnames';
import {Header, Title, Body, Footer} from './Content.jsx';
import Collapse from './Collapse';
import {getContextClass, getContextContent, getShadeClass} from './bootstrapPropUtils';
import {errorMessage} from '../utils/reactErrorUtils';

import './Panel.sass';

class PanelBodySkin extends Component {
  render() {
    let {collapse, children} = this.props;
    let result = <div {...this.props}>
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
  shade?: 'darker' | 'brighter',
  darker?: boolean,
  brighter?: boolean,
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
    BodySkin:       PropTypes.any.isRequired,
    ContainerClassName: PropTypes.string.isRequired,
    HeaderClassName:PropTypes.string.isRequired,
    TitleClassName: PropTypes.string.isRequired,
    BodyClassName:  PropTypes.string.isRequired,
    FooterClassName:PropTypes.string.isRequired,
  };
  getChildContext(): Object {
    return {
      BodySkin:       PanelBodySkin,
      ContainerClassName:'panel',
      HeaderClassName:'panel-heading',
      TitleClassName: 'panel-title',
      BodyClassName:  'panel-body',
      FooterClassName:'panel-footer',
    };
  }
  render(): ReactElement {
    let {className, children, header, headerProps, title, footer, collapse, skin} = this.props;
    let contextClass = getContextClass(this.props) || 'default';
    let shadeClass = getShadeClass(this.props);
    let content = getContextContent(this.props);

    if (content && (contextClass === 'danger' || contextClass === 'warning' || content instanceof Error)) {
      content = errorMessage(content);
    }

    className = classNames(className, 'panel', 'panel-' + contextClass, shadeClass);

    if (skin || (!header && !title && !footer)) {
      return Children.count(children) === 1 && children ? React.cloneElement(children, {className}) :
        <div {...this.props} className={className}>
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
