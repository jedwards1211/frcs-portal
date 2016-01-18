import React, {Component, PropTypes} from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import classNames from 'classnames';

import Button from '../bootstrap/Button';

import {stringOrNumber} from './calibrationValidation';
import * as CalibrationSteps from './CalibrationSteps';


import {BACK, NEXT, APPLY, CANCEL} from './calibrationActions';

/**
 * The Back, Next, and Apply buttons for a CalibrationWizard, separated out because
 * if the wizard is in a modal, the buttons go in a footer, rather than being a
 * sibling of the wizard in the content.
 */
export default class CalibrationWizardButtons extends Component {
  static propTypes = {
    stepNumber: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.oneOf(['numPoints', 'confirm']),
    ]),
    calibration: ImmutablePropTypes.shape({
      numPoints: stringOrNumber,
      points: ImmutablePropTypes.listOf(ImmutablePropTypes.shape({
        x: stringOrNumber,
        y: stringOrNumber,
      })),
    }).isRequired,
    dispatch: PropTypes.func,
  };
  static defaultProps = {
    dispatch: function() {},
  };
  focusApply() {
    if (this.refs.apply) {
      this.refs.apply.focus();
    }
  }
  render() {
    let {className, stepNumber, dispatch} = this.props;

    let disableNext;
    if (stepNumber === 'numPoints') {
      const validation = CalibrationSteps.NumPoints.validate(this.props);
      disableNext = !validation.valid;
    }
    else if (stepNumber !== 'confirm') {
      const validation = CalibrationSteps.Point.validate(this.props);
      disableNext = !validation.valid;
    }

    let buttons = [
      <Button key="cancel" onClick={() => dispatch({type: CANCEL})}>
        Cancel
      </Button>,
      <Button key="back" onClick={() => dispatch({type: BACK})}>
        <i className="glyphicon glyphicon-chevron-left" /> Back
      </Button>
    ];
    if (stepNumber === 'confirm') {
      const validation = CalibrationSteps.Confirm.validate(this.props);
      buttons.push(
        <button type="button" className="btn btn-primary" ref="apply" key="apply"
                onClick={() => dispatch({type: APPLY})} disabled={!validation.valid}>
          Apply
        </button>
      );
    }
    else {
      buttons.push(
        <Button.Primary key="next" onClick={() => dispatch({type: NEXT})} disabled={disableNext}>
          <i className="glyphicon glyphicon-chevron-right" /> Next
        </Button.Primary>
      );
    }

    className = classNames(className, 'mf-calibration-wizard-buttons');

    return <span {...this.props} className={className}>{buttons}</span>;
  }
}
