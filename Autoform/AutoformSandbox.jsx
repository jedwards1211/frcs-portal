/* eslint-disable no-console */

import React, {Component} from 'react';
import _ from 'lodash';

export default class AutoformTester extends Component {
  constructor(props) {
    super(props);
    this.state = props.initState || {};
  }
  onAutoformFieldChange = (field, newValue, options) => {
    console.log('autoform field change: ', field, newValue, options);
    if (options && options.autoformPath) {
      this.setState(_.set(_.cloneDeep(this.state), [...options.autoformPath, field], newValue));
    }
    else {
      this.setState({[field]: newValue});
    }
  };
  render() {
    let {children} = this.props;
    let {onAutoformFieldChange} = this;
    
    return React.cloneElement(children, {
      ...this.state,
      onAutoformFieldChange
    });
  }
}
