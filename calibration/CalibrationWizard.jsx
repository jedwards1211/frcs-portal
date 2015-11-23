import React, {Component, PropTypes} from 'react';
import _ from 'lodash';

import PageSlider from '../common/PageSlider';

import * as CalibrationSteps from './CalibrationSteps';
import CalibrationWizardButtons from './CalibrationWizardButtons';

export default class CalibrationWizard extends Component {
  static propTypes = {
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
  render() {
    let {stepNumber, calibration: {numPoints, points}} = this.props;

    return <div className="mf-calibration-wizard">
      <PageSlider activeIndex={stepNumber}>
        <CalibrationSteps.NumPoints {...this.props}/>
        {_.range(points.length).map(pointIndex => (
          <CalibrationSteps.Point {...this.props} key={pointIndex} pointIndex={pointIndex}/>
        ))}
        {<CalibrationSteps.Confirm {...this.props}/>}
      </PageSlider>
      <CalibrationWizardButtons {...this.props}/>
    </div>;
  }
}
