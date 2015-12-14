import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import PageSlider from '../common/PageSlider';

import * as CalibrationSteps from './CalibrationSteps';
import CalibrationWizardButtons from './CalibrationWizardButtons';

import './CalibrationWizard.sass';

export default class CalibrationWizard extends Component {
  static propTypes = {
    isFocused: PropTypes.bool,
    stepNumber: PropTypes.number.isRequired,
    calibration: PropTypes.shape({
      numPoints: CalibrationSteps.stringOrNumber,
      points: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
    }),
    inputValue: PropTypes.number,
    inputUnits: PropTypes.string,
    inputPrecision: PropTypes.number,
    outputUnits: PropTypes.string,
    outputPrecision: PropTypes.number,
    dispatch: PropTypes.func,
  }
  _pointSteps = [];
  updateFocus = () => {
    let {stepNumber, calibration: {points}} = this.props;
    if (stepNumber === points.length + 1) {
      this._buttons.focusApply();
    }
  }
  componentDidAppear() {
    this._pageSlider.componentDidAppear();
  }
  componentDidEnter() {
    this._pageSlider.componentDidEnter();
  }
  componentDidLeave() {
    this._pageSlider.componentDidLeave();
  }
  render() {
    let {className, stepNumber, calibration: {points}} = this.props;

    className = classNames(className, 'mf-calibration-wizard');

    return <div className={className}>
      <PageSlider activeIndex={stepNumber} onTransitionEnd={this.updateFocus} ref={c => this._pageSlider = c}>
        <CalibrationSteps.NumPoints ref={c => this._numPointsStep = c} {...this.props}/>
        {_.range(points.length).map(pointIndex => (
          <CalibrationSteps.Point {...this.props} ref={c => this._pointSteps[pointIndex] = c}
                                                  key={pointIndex} pointIndex={pointIndex}/>
        ))}
        {<CalibrationSteps.Confirm {...this.props}/>}
      </PageSlider>
      <CalibrationWizardButtons {...this.props} ref={c => this._buttons = c}/>
    </div>;
  }
}
