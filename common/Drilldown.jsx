/* @flow */

import React, {Component, PropTypes} from 'react';
import path from 'path';

import type {DrilldownRoute} from './DrilldownModel.jsx';
import DefaultDrilldownSkin from './DefaultDrilldownSkin.jsx';

type LinkProps = {
  to: string,
  disabled?: boolean,
  children?: any,
};

export class Link extends Component<void,LinkProps,void> {
  static contextTypes = {
    drilldown: PropTypes.any.isRequired,
    path: PropTypes.any.isRequired,
  };
  render(): ReactElement {
    let {to, children, disabled} = this.props;
    let {drilldown: {navigate}} = this.context;
    return <a href="" {...this.props} onClick={e => {
      e.preventDefault();
      if (!disabled) {
        navigate(path.join(this.context.path, to));
      }
    }}>
      {children}
    </a>;
  }
}

export default class Drilldown extends Component {
  static contextTypes = {
    DrilldownSkin: PropTypes.any,
  };
  props: {
    className?: string,
    path: string,
    root: ?DrilldownRoute,
    skin?: any,
    onPathChange: (newPath: string) => any,
  };
  static defaultProps: {
    onPathChange: (newPath: string) => any,
  } = {
    onPathChange() {},
  };
  static childContextTypes = {
    drilldown: PropTypes.any.isRequired,
    path: PropTypes.string.isRequired,
  };
  getChildContext(): Object {
    return {
      drilldown: this,
      path: path.normalize(this.props.path),
    };
  }
  navigate: (toPath: string) => void = (toPath) => {
    let newPath = path.normalize(path.isAbsolute(toPath) ? toPath : path.join(this.props.path, toPath));
    this.props.onPathChange(newPath);
  };
  render(): ReactElement {
    let DrilldownSkin = this.context.DrilldownSkin || this.props.skin || DefaultDrilldownSkin;
    return <DrilldownSkin {...this.props}/>;
  }
}
