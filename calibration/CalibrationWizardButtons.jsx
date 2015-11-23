import React, {Component, PropTypes} from 'react';

import Button from '../bootstrap/Button';

import {isValidNumPoints, isValidOutputValue, stringOrNumber} from './CalibrationSteps';

export const BACK = 'BACK';
export const NEXT = 'NEXT';
export const APPLY = 'APPLY';

/**
 * The Back, Next, and Apply buttons for a CalibrationWizard, separated out because
 * if the wizard is in a modal, the buttons go in a footer, rather than being a
 * sibling of the wizard in the content.
 */
export default class CalibrationWizardButtons extends Component {
  static propTypes = {
    stepNumber: PropTypes.number.isRequired,
    maxNumPoints: PropTypes.number.isRequired,
    calibration: PropTypes.shape({
      numPoints: stringOrNumber,
    }).isRequired,
    backDisabledStepNumber: PropTypes.number,
    dispatch: PropTypes.func,
  }
  static defaultProps = {
    dispatch: function() {},
  }
  render() {
    let {stepNumber, calibration, maxNumPoints, backDisabledStepNumber, dispatch} = this.props;

    var notEnoughPoints = !calibration.numPoints;

    var disableNext;
    if (stepNumber === 0) {
      disableNext = !isValidNumPoints(calibration.numPoints, maxNumPoints);
    }
    else if (stepNumber <= calibration.numPoints) {
      disableNext = !isValidOutputValue(calibration.points[stepNumber - 1].y);
    }

    var buttons = [
      <Button key="back" onClick={() => dispatch({type: BACK})}
              disabled={stepNumber <= backDisabledStepNumber}>
        <i className="glyphicon glyphicon-chevron-left" /> Back
      </Button>
    ];
    if (stepNumber <= calibration.numPoints || notEnoughPoints) {
      buttons.push(
        <Button.Primary key="next" onClick={() => dispatch({type: NEXT})} disabled={disableNext}>
          <i className="glyphicon glyphicon-chevron-right" /> Next
        </Button.Primary>
      );
    }
    else {
      buttons.push(
        <Button.Primary key="apply" onClick={() => dispatch({type: APPLY})}>Apply</Button.Primary>
      );
    }

    return (
      <span {...this.props}>{buttons}</span>
    );
  }
}
