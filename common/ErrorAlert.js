import React, {Component, PropTypes} from 'react';

import Alert from '../bootstrap/Alert';

export function errorMessage(err) {
  if (err === null || err === undefined) {
    return '';
  }
  if (err instanceof Error) {
    return err.message || err.toString();
  }
  if (typeof err !== 'string' || !err) {
    return 'an unknown error has occurred';
  }
  return err;
}

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
