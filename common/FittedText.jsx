import React, {Component, PropTypes} from 'react';
import PureRender from 'react-addons-pure-render-mixin';
import _ from 'lodash';

import layoutText from '../utils/layoutText';

export default class FittedText extends Component {
  state = {};
  shouldComponentUpdate = PureRender.shouldComponentUpdate;
  remeasure = _.throttle(() => {
    if (this.mounted && this.root) {
      let {offsetWidth, offsetHeight} = this.root;
      let {fontFamily, fontWeight} = window.getComputedStyle(root);
      this.setState({offsetWidth, offsetHeight, fontFamily, fontWeight});
    }
  }, 50);
  componentDidMount() {
    this.mounted = true;
    this.remeasure();
    window.addEventListener('resize', this.remeasure);
  }
  componentWillUnmount() {
    this.mounted = false;
    window.removeEventListener('resize', this.remeasure);
  }
  componentDidUpdate() {
    this.remeasure(); 
  }
  render() {
    let {text, separators, splitRegExp, log, style} = this.props;
    let {offsetWidth, offsetHeight, fontFamily, fontWeight} = this.state;

    style = Object.assign({overflow: 'visible'}, style);
    let content = [];

    if (offsetWidth && offsetHeight && fontFamily && fontWeight) {
      let {lines, fontSize} = layoutText(text, {
        fontFamily,
        fontWeight,
        maxWidth:   offsetWidth,
        maxHeight:  offsetHeight,
        separators,
        splitRegExp,
        log,
      });

      if (lines.length > 0) {
        content.push(lines[0]);
        for (var i = 1; i < lines.length; i++) {
          content.push(<br/>);
          content.push(lines[i]);
        }
      }

      style.fontSize = fontSize;
      style.lineHeight = fontSize + 'px';
    }

    return <span {...this.props} ref={c => this.root = c} style={style}>{content.length ? content : undefined}</span>;
  }  
}
