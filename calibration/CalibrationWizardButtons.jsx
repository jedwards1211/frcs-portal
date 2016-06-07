/* @flow */

import React, {Component, PropTypes} from 'react'
import classNames from 'classnames'
import {TransitionListener} from 'react-transition-context'

import Button from '../bootstrap/Button.jsx'
import Spinner from '../common/Spinner.jsx'

import * as CalibrationSteps from './CalibrationSteps'

import type {DefaultProps, Props} from './calibrationTypes'
import {defaultProps} from './calibrationTypes'

/**
 * The Back, Next, and Apply buttons for a CalibrationWizard, separated out because
 * if the wizard is in a modal, the buttons go in a footer, rather than being a
 * sibling of the wizard in the content.
 */
export default class CalibrationWizardButtons extends Component<DefaultProps, Props, void> {
  static defaultProps = defaultProps;
  static contextTypes = {
    transitionContext: PropTypes.object
  };

  focusApplyIfNecessary: (props?: Props, context?: any) => void = (props = this.props, context = this.context) => {
    const {transitionContext} = context
    const {stepNumber} = props

    if (!transitionContext || transitionContext.getState() === 'in' && stepNumber === 'confirm' && this.refs.apply) {
      this.refs.apply.focus()
    }
  };
  didComeIn: Function = () => this.focusApplyIfNecessary();

  componentWillReceiveProps(nextProps: Props, nextContext: any) {
    this.focusApplyIfNecessary(nextProps, nextContext)
  }

  render() {
    let {className, stepNumber, onCancel, onBack, onNext, onApply, applying} = this.props

    let disableNext
    if (stepNumber === 'numPoints') {
      const validation = CalibrationSteps.NumPoints.validate(this.props)
      disableNext = !validation.valid
    }
    else if (stepNumber !== 'confirm') {
      const validation = CalibrationSteps.Point.validate({...this.props, pointIndex: stepNumber})
      disableNext = !validation.valid
    }

    let buttons = [
      <Button key="cancel" onClick={onCancel}>
        Cancel
      </Button>,
      <Button key="back" onClick={stepNumber === 'numPoints' ? onCancel : onBack} disabled={applying}>
        <i className="glyphicon glyphicon-chevron-left" /> Back
      </Button>
    ]
    if (stepNumber === 'confirm') {
      const validation = CalibrationSteps.Confirm.validate(this.props)
      buttons.push(
        <button type="button" className="btn btn-primary" ref="apply" key="apply"
            onClick={onApply} disabled={!validation.valid || applying}
        >
          {applying
            ? <span><Spinner /> Applying...</span>
            : 'Apply'
          }
        </button>
      )
    }
    else {
      buttons.push(
        <Button primary key="next" onClick={onNext} disabled={disableNext || applying}>
          <i className="glyphicon glyphicon-chevron-right" /> Next
        </Button>
      )
    }

    className = classNames(className, 'mf-calibration-wizard-buttons')

    return <span {...this.props} className={className}>
      {buttons}
      <TransitionListener didComeIn={this.didComeIn} />
    </span>
  }
}
