import React, {Component, PropTypes} from 'react';

class TDSkin extends Component {
  render() {
    return <div {...this.props}/>;
  }
}

class THSkin extends Component {
  static contextTypes = {
    showTH: PropTypes.bool
  };
  render() {
    if (this.context.showTH === false) return null;
    return <div {...this.props}/>;
  }
}

class TRSkin extends Component {
  render() {
    return <div {...this.props}/>;
  }
}

class TBodySkin extends Component {
  
}
