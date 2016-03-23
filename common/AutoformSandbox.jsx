import React, {Component} from 'react';

export default class AutoformTester extends Component {
  constructor(props) {
    super(props);
    this.state = props.initState || {};
  }
  onAutoformFieldChange = (field, newValue) => {
    console.log('autoform field change: ', field, newValue);
    this.setState({[field]: newValue});
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
