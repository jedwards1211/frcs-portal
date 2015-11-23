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
  updateFocus = () => {
    let {isFocused, stepNumber, calibration: {points}} = this.props;
    if (isFocused) {
      if (stepNumber === 0) {
        this.refs.numPointsStep.focusInput();
      }
      else if (stepNumber - 1 < points.length) {
        this.refs['pointStep-' + (stepNumber - 1)].focusInput();
      }
      else {
        this.refs.buttons.focusApply();
      }
    }
  }
  render() {
    let {className, stepNumber, calibration: {points}} = this.props;

    className = classNames(className, 'mf-calibration-wizard');

    return <div className={className}>
      <PageSlider activeIndex={stepNumber} onTransitionEnd={this.updateFocus}>
        <CalibrationSteps.NumPoints ref="numPointsStep" {...this.props}/>
        {_.range(points.length).map(pointIndex => (
          <CalibrationSteps.Point {...this.props} ref={"pointStep-" + pointIndex}
                                                  key={pointIndex} pointIndex={pointIndex}/>
        ))}
        {<CalibrationSteps.Confirm {...this.props}/>}
      </PageSlider>
      <CalibrationWizardButtons {...this.props} ref="buttons"/>
    </div>;
  }
}
