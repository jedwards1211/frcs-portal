/* @flow */

import React from 'react'
import {Route} from 'react-router'

import Alert from '../bootstrap/Alert'
import Spinner from '../common/Spinner'

const LoadingComponent = () => <Alert info><Spinner /> Loading...</Alert>

export default <Route path="*" component={LoadingComponent} />
