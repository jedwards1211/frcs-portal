import React, {Component, PropTypes} from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import classNames from 'classnames';
import _ from 'lodash';

import PageSlider from '../common/PageSlider';

import * as CalibrationSteps from './CalibrationSteps';
import CalibrationWizardButtons from './CalibrationWizardButtons';

import './CalibrationWizard.sass';

const valueAndUnit = ImmutablePropTypes.shape({
  value: PropTypes.number,
  units: PropTypes.string,
});

export default class CalibrationWizard extends Component {
  static propTypes = {
    isFocused: PropTypes.bool,
    stepNumber: PropTypes.number.isRequired,
    calibration: ImmutablePropTypes.shape({
      numPoints: CalibrationSteps.stringOrNumber,
      points: ImmutablePropTypes.listOf(ImmutablePropTypes.shape({
        x: CalibrationSteps.stringOrNumber,
        y: CalibrationSteps.stringOrNumber,
      })).isRequired,
    }),
    calibrationState: ImmutablePropTypes.shape({
      input: valueAndUnit,
      output: valueAndUnit,
    }).isRequired,
    inputPrecision: PropTypes.number,
    outputPrecision: PropTypes.number,
    dispatch: PropTypes.func,
  }
  _pointSteps = [];
  updateFocus = () => {
    let {stepNumber, calibration} = this.props;
    if (stepNumber === calibration.get('points').size + 1) {
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
    let {className, stepNumber, calibration} = this.props;
    const points = calibration.get('points');

    className = classNames(className, 'mf-calibration-wizard');

    return <div className={className}>
      <PageSlider activeIndex={stepNumber} onTransitionEnd={this.updateFocus} ref={c => this._pageSlider = c}>
        <CalibrationSteps.NumPoints ref={c => this._numPointsStep = c} {...this.props}/>
        {_.range(points.size).map(pointIndex => (
          <CalibrationSteps.Point {...this.props} ref={c => this._pointSteps[pointIndex] = c}
                                                  key={pointIndex} pointIndex={pointIndex}/>
        ))}
        {<CalibrationSteps.Confirm {...this.props}/>}
      </PageSlider>
      <CalibrationWizardButtons {...this.props} ref={c => this._buttons = c}/>
    </div>;
  }
}
