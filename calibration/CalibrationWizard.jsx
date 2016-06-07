/* @flow */

import React, {Component} from 'react'
import classNames from 'classnames'
import _ from 'lodash'

import PageSlider from '../common/PageSlider'

import * as CalibrationSteps from './CalibrationSteps'
import CalibrationWizardButtons from './CalibrationWizardButtons'

import type {DefaultProps, Props} from './calibrationTypes'
import {defaultProps} from './calibrationTypes'

import './CalibrationWizard.sass'

export default class CalibrationWizard extends Component<DefaultProps, Props, void> {
  static defaultProps = defaultProps;
  render(): React.Element {
    let {className, stepNumber, calibration} = this.props
    const points = calibration.get('points')

    className = classNames(className, 'mf-calibration-wizard')

    let majorActiveIndex, minorActiveIndex
    switch (stepNumber) {
    case 'numPoints':
      majorActiveIndex = minorActiveIndex = 0
      break
    case 'confirm':
      majorActiveIndex = 2
      minorActiveIndex = points.size - 1
      break
    default:
      majorActiveIndex = 1
      minorActiveIndex = stepNumber
      break
    }

    return <div className={className}>
      <PageSlider activeIndex={majorActiveIndex}>
        <CalibrationSteps.NumPoints {...this.props} />
        <PageSlider activeIndex={minorActiveIndex}>
          {_.range(points.size).map(pointIndex => (
            <CalibrationSteps.Point {...this.props} key={pointIndex} pointIndex={pointIndex} />
          ))}
        </PageSlider>
        <CalibrationSteps.Confirm {...this.props} />
      </PageSlider>
      {/* flow-issue(jcore-portal) */}
      <CalibrationWizardButtons {...this.props} />
    </div>
  }
}
