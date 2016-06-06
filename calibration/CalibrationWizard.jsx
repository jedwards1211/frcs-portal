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
  _pointSteps: React.Component[] = [];
  _pageSlider: PageSlider;
  _buttons: CalibrationWizardButtons;
  updateFocus: Function = () => {
    // let {stepNumber, calibration} = this.props;
    // if (stepNumber === calibration.get('points').size + 1) {
    //   this._buttons.focusApply();
    // }
  };
  componentDidAppear() {
    this._pageSlider.componentDidAppear()
  }
  componentDidEnter() {
    this._pageSlider.componentDidEnter()
  }
  componentDidLeave() {
    this._pageSlider.componentDidLeave()
  }
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
        <PageSlider activeIndex={minorActiveIndex} onTransitionEnd={this.updateFocus} ref={c => this._pageSlider = c}>
          {_.range(points.size).map(pointIndex => (
            <CalibrationSteps.Point {...this.props} ref={c => this._pointSteps[pointIndex] = c}
                key={pointIndex} pointIndex={pointIndex}
            />
          ))}
        </PageSlider>
        <CalibrationSteps.Confirm {...this.props} />
      </PageSlider>
      {/* flow-issue(jcore-portal) */}
      <CalibrationWizardButtons {...this.props} ref={c => this._buttons = c} />
    </div>
  }
}
