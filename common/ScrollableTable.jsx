import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';

import './ScrollableTable.sass';

/**
 * This is a skin for the skinnable Table (see ./Table.jsx) that wraps it in a scrollable div
 * and keeps column/row headers fixed to the top/left.  It does so using CSS position: relative
 * and top/left on the <td> and <th> elements.
 * 
 * To create a row header, use <th rowHeader> (in <thead> or <tbody>).
 * 
 * The sass provides two nice styling classes: 
 *   .is-bordered - applies borders to all cells and scrollable div
 *   .is-unbordered-in-top-left-cell (must be used with .is-bordered) - gets rid of the top/left borders 
 *                                                                      of the top left cell
 */
export default class ScrollableTable extends Component {
  state = {
    scrollTop: 0,
    scrollLeft: 0
  };
  static childContextTypes = {
    scrollTop: PropTypes.number,
    scrollLeft: PropTypes.number,
    THeadSkin: PropTypes.any.isRequired,
    THSkin: PropTypes.any.isRequired,
    TDSkin: PropTypes.any.isRequired
  };
  getChildContext() {
    return {
      // pass down scrollTop/scrollLeft so that column/row headers can offset themselves
      // to stay at the top/left of the table
      ...this.state,
      THeadSkin,
      THSkin,
      TDSkin
    };
  }
  onScroll = e => {
    let {scrollTop, scrollLeft} = e.target;
    this.setState({scrollTop, scrollLeft});
  };
  render() {
    let {className} = this.props;
    className = classNames(className, 'mf-ScrollableTable');
    return <div {...this.props} className={className} onScroll={this.onScroll}/>;
  }
}

class TDSkin extends Component {
  static contextTypes = {
    showTD: PropTypes.bool
  };
  render() {
    if (this.context.showTD === false) return null;
    // for some reason Safari doesn't draw a border around empty <td>s.  Adding this span makes it draw a border
    return <td {...this.props} children={this.props.children || <span/>}/>;
  }
}

class THSkin extends Component {
  static contextTypes = {
    showTH: PropTypes.bool,
    inTHead: PropTypes.bool,
    scrollLeft: PropTypes.number,
    scrollTop: PropTypes.number
  };
  render() {
    let {rowHeader, className} = this.props;
    let style = this.props.style || {};
    let {showTH, inTHead, scrollLeft, scrollTop} = this.context;
    if (showTH === false) return null;

    style = {
      ...style,
      left: rowHeader ? scrollLeft : undefined,
      top: inTHead ? scrollTop : undefined
    };
    className = classNames(className, {'is-row-header': rowHeader});

    // for some reason Safari doesn't draw a border around empty <th>s.  Adding this span makes it draw a border
    return <th {...this.props} style={style} className={className} children={this.props.children || <span/>}/>;
  }
}

class THeadSkin extends Component {
  static childContextTypes = {
    inTHead: PropTypes.bool
  };
  getChildContext() {
    return {
      inTHead: true
    };
  }
  render() {
    return <thead {...this.props}/>;
  } 
}
