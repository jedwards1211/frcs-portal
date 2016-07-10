/* @flow */

import * as Immutable from 'immutable'
import React, {Component} from 'react'
import {connect} from 'react-redux'

import calibrationActions from './calibrationActions'

import type {Dispatch} from '../flowtypes/reduxTypes'

type Props = {
  children: any,
  reduxPaths: {
    viewState: any[],
    calibrationState: any[],
  },
  calibration?: Immutable.Map,
  calibrationState?: Immutable.Map,
  dispatch: Dispatch,
}

class ReduxCalibration extends Component<void, Props, void> {
  render(): React.Element {
    const {children, reduxPaths, dispatch} = this.props
    const actions = calibrationActions({reduxPaths})

    return React.cloneElement(children, {
      ...this.props,
      onBack: () => dispatch(actions.back()),
      onNext: () => dispatch(actions.next()),
      onNumPointsChange: numPoints => dispatch(actions.setNumPoints(numPoints)),
      onInputValueChange: (pointIndex, inputValue) => dispatch(actions.setInputValue(pointIndex, inputValue)),
      onOutputValueChange: (pointIndex, outputValue) => dispatch(actions.setOutputValue(pointIndex, outputValue)),
      onEditManuallyClick: () => dispatch(actions.goToEditManually()),
      onAddPoint: point => dispatch(actions.addPoint(point)),
      onDeletePoint: pointIndex => dispatch(actions.deletePoint(pointIndex)),
    })
  }
}

function select(state: Immutable.Map, props: Props): Object {
  const {reduxPaths} = props
  const viewState = state.getIn(reduxPaths.viewState) || Immutable.Map()
  return {
    ...viewState.toObject(),
    calibrationState: state.getIn(reduxPaths.calibrationState)
  }
}

export default connect(select)(ReduxCalibration)
