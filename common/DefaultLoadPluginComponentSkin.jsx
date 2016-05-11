/* @flow */

import React, {Component} from 'react';

import Alert from '../bootstrap/Alert.jsx';
import Spinner from './Spinner.jsx';

type Props = {
  pluginName?: string,
  loading?: boolean,
  loadError?: Error,
  children?: React.Element
};

export default class DefaultLoadPluginComponentSkin extends Component<void,Props,void> {
  render(): React.Element {
    let {pluginName, loading, loadError, children} = this.props;
    
    if (loading || loadError) {
      return (
        <Alert info={loading} error={loadError}>
          {loading && <span><Spinner/> Loading plugin: {pluginName}...</span>}
        </Alert>
      );
    }
    return children || null;
  }
}
