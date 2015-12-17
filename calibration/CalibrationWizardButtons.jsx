import React, {Component, PropTypes} from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import classNames from 'classnames';
import _ from 'lodash';

import Button from '../bootstrap/Button';

import {isValidNumPoints, isValidOutputValue, stringOrNumber} from './calibrationValidation';


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
    maxNumPoints: PropTypes.number.isRequired,
    calibration: ImmutablePropTypes.shape({
      numPoints: stringOrNumber,
      points: ImmutablePropTypes.listOf(ImmutablePropTypes.shape({
        x: stringOrNumber,
        y: stringOrNumber,
      })),
    }).isRequired,
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
    let {className, stepNumber, calibration, maxNumPoints, dispatch} = this.props;
    const points    = calibration.get('points');

    let disableNext;
    if (stepNumber === 'numPoints') {
      const numPoints = calibration.get('numPoints');
      disableNext = !isValidNumPoints(numPoints, maxNumPoints);
    }
    else if (stepNumber !== 'confirm') {
      disableNext = !isValidOutputValue(calibration.getIn(['points', stepNumber, 'y']));
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
