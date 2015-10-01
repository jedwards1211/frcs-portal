import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classNames from 'classnames';
import _ from 'lodash';

import './Toggle.sass';

export default React.createClass({
  mixins: [PureRenderMixin],

  displayName: 'Toggle',

  propTypes: {
    checked: React.PropTypes.bool,
    defaultChecked: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    name: React.PropTypes.string,
    value: React.PropTypes.string,
    id: React.PropTypes.string,
    'aria-labelledby': React.PropTypes.string,
    'aria-label': React.PropTypes.string
  },

  getInitialState() {
    var checked = false;
    if ('checked' in this.props) {
      checked = this.props.checked
    } else if ('defaultChecked' in this.props) {
      checked = this.props.defaultChecked
    }
    return {
      checked: !!checked,
      hasFocus: false
    }
  },

  componentWillReceiveProps(nextProps) {
    if ('checked' in nextProps) {
      this.setState({checked: !!nextProps.checked})
    }
  },

  handleClick(event) {
    if ('disabled' in this.props && !!this.props.disabled) {
      return; 
    }
    if (!('checked' in this.props)) {
      var newChecked = !this.state.checked;
      this.setState({checked: newChecked})
      this.props.onChange && this.props.onChange(newChecked);
    }
    else {
      this.props.onChange && this.props.onChange(!this.state.checked);
    }
  },

  handleFocus() {
    this.setState({hasFocus: true})
  },

  handleBlur() {
    this.setState({hasFocus: false})
  },

  render() {
    var classes = classNames('react-toggle', {
      'react-toggle--checked': this.state.checked,
      'react-toggle--focus': this.state.hasFocus,
      'react-toggle--disabled': this.props.disabled
    }, this.props.className)

    var otherProps = _.clone(this.props);
    delete otherProps.className;
    delete otherProps.onClick;
    delete otherProps.onChange;

    return (
      <div className={classes} 
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onClick={this.handleClick}
        {...otherProps}>
        <div className="react-toggle-track">&nbsp;</div>
        <div className="react-toggle-thumb"></div>
      </div>
    )
  }
})
