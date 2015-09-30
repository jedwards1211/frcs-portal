'use strict';

import React from 'react';

// ReactTransitionGroup replaces refs on its children
// in a call to cloneWithProps() so I made this workaround
// to get refs to the Blocks into the BlockGrid

export default {
  propTypes: {
    workaroundRef:  React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]),
    workaroundRefs: React.PropTypes.object
  },
  componentDidMount() {
    if (this.props.workaroundRef && this.props.workaroundRefs) {
      this.props.workaroundRefs[this.props.workaroundRef] = this; 
    }
  },
  componentWillUnmount() {
    if (this.props.workaroundRef && this.props.workaroundRefs) {
      delete this.props.workaroundRefs[this.props.workaroundRef];
    }
  }
};