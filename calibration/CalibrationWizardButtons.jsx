import React, {Component, PropTypes} from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import classNames from 'classnames';
import _ from 'lodash';

import Button from '../bootstrap/Button';

import {isValidNumPoints, isValidOutputValue, stringOrNumber} from './CalibrationSteps';


import {BACK, NEXT, APPLY, CANCEL} from './calibrationActions';

/**
 * The Back, Next, and Apply buttons for a CalibrationWizard, separated out because
 * if the wizard is in a modal, the buttons go in a footer, rather than being a
 * sibling of the wizard in the content.
 */
export default class CalibrationWizardButtons extends Component {
  static propTypes = {
    stepNumber: PropTypes.number.isRequired,
    maxNumPoints: PropTypes.number.isRequired,
    calibration: ImmutablePropTypes.shape({
      numPoints: stringOrNumber,
      points: ImmutablePropTypes.listOf(ImmutablePropTypes.shape({
        x: stringOrNumber,
        y: stringOrNumber,
      })),
    }).isRequired,
    backDisabledStepNumber: PropTypes.number,
    dispatch: PropTypes.func,
  }
  static defaultProps = {
    dispatch: function() {},
  }
  focusApply() {
    if (this.refs.apply) {
      this.refs.apply.focus();
    }
  }
  render() {
    let {className, stepNumber, calibration, maxNumPoints, backDisabledStepNumber, dispatch} = this.props;
    const numPoints = calibration.get('numPoints');
    const points    = calibration.get('points');

    var notEnoughPoints = !Number(numPoints);

    var disableNext;
    if (stepNumber === 0) {
      disableNext = !isValidNumPoints(numPoints, maxNumPoints);
    }
    else if (stepNumber <= numPoints) {
      disableNext = !isValidOutputValue(calibration.getIn(['points', stepNumber - 1, 'y']));
    }

    var buttons = [
      <Button key="cancel" onClick={() => dispatch({type: CANCEL})}>
        Cancel
      </Button>,
      <Button key="back" onClick={() => dispatch({type: BACK})}
              disabled={stepNumber <= backDisabledStepNumber}>
        <i className="glyphicon glyphicon-chevron-left" /> Back
      </Button>
    ];
    if (stepNumber <= numPoints || notEnoughPoints) {
      buttons.push(
        <Button.Primary key="next" onClick={() => dispatch({type: NEXT})} disabled={disableNext}>
          <i className="glyphicon glyphicon-chevron-right" /> Next
        </Button.Primary>
      );
    }
    else {
      let validCount = 0;
      points.forEach(point => {
        const x = parseFloat(point.get('x'));
        const y = parseFloat(point.get('y'));
        if (_.isNumber(x) && !isNaN(x) && _.isNumber(y) && !isNaN(y)) validCount++;
      });
      buttons.push(
        <button type="button" className="btn btn-primary" ref="apply" key="apply"
                onClick={() => dispatch({type: APPLY})} disabled={validCount < 2}>
          Apply
        </button>
      );
    }

    className = classNames(className, 'mf-calibration-wizard-buttons');

    return <span {...this.props} className={className}>{buttons}</span>;
  }
}
