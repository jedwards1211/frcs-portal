import React, {Component, PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import classNames from 'classnames'

import Button from '../bootstrap/Button'

import {stringOrNumber} from './calibrationValidation'
import * as CalibrationSteps from './CalibrationSteps'

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
    onCancelClick: PropTypes.func,
    onBackClick: PropTypes.func,
    onNextClick: PropTypes.func,
    onApplyClick: PropTypes.func
  };
  focusApply() {
    if (this.refs.apply) {
      this.refs.apply.focus()
    }
  }
  render() {
    let {className, stepNumber, onCancelClick, onBackClick, onNextClick, onApplyClick} = this.props

    let disableNext
    if (stepNumber === 'numPoints') {
      const validation = CalibrationSteps.NumPoints.validate(this.props)
      disableNext = !validation.valid
    }
    else if (stepNumber !== 'confirm') {
      const validation = CalibrationSteps.Point.validate(this.props)
      disableNext = !validation.valid
    }

    let buttons = [
      <Button key="cancel" onClick={onCancelClick}>
        Cancel
      </Button>,
      <Button key="back" onClick={onBackClick}>
        <i className="glyphicon glyphicon-chevron-left" /> Back
      </Button>
    ]
    if (stepNumber === 'confirm') {
      const validation = CalibrationSteps.Confirm.validate(this.props)
      buttons.push(
        <button type="button" className="btn btn-primary" ref="apply" key="apply"
            onClick={onApplyClick} disabled={!validation.valid}
        >
          Apply
        </button>
      )
    }
    else {
      buttons.push(
        <Button primary key="next" onClick={onNextClick} disabled={disableNext}>
          <i className="glyphicon glyphicon-chevron-right" /> Next
        </Button>
      )
    }

    className = classNames(className, 'mf-calibration-wizard-buttons')

    return <span {...this.props} className={className}>{buttons}</span>
  }
}
