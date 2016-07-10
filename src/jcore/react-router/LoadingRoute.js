/* @flow */

import React from 'react'
import {Route} from 'react-router'

import Alert from '../bootstrap/Alert.jsx'
import Spinner from '../common/Spinner.jsx'

const LoadingComponent = () => <Alert info><Spinner /> Loading...</Alert>

export default <Route path="*" component={LoadingComponent} />
