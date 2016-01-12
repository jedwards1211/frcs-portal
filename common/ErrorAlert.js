import React, {Component, PropTypes} from 'react';

import {errorMessage} from '../utils/errorUtils';
import Alert from '../bootstrap/Alert';

export default class ErrorAlert extends Component {
  static propTypes = {
    error: PropTypes.oneOfType([
      PropTypes.instanceOf(Error),
      PropTypes.string,
      PropTypes.node,
    ]).isRequired,
  }
  render() {
    const {error} = this.props;
    if (React.isValidElement(error)) {
      return error;
    }
    return <Alert.Danger>{errorMessage(error)}</Alert.Danger>;
  }
}
