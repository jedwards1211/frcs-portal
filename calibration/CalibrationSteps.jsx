import React, {Component} from 'react'
import _ from 'lodash'
import classNames from 'classnames'

import Button from '../bootstrap/Button'

import AlertGroup from '../common/AlertGroup'
import validationClassNames from '../common/validationClassNames'

import {isValidNumPoints, isValidInputValue, isValidOutputValue,
  isValidInputValueOrBlank, isValidOutputValueOrBlank} from './calibrationValidation'
import {isEmptyValue} from '../utils/validationUtils'

import './CalibrationSteps.sass'

function autoPrecision(value) {
  value = Math.abs(value)
  if (value < 10) {
    return 3
  }
  if (value < 100) {
    return 2
  }
  if (value < 1000) {
    return 1
  }
  return 0
}

function computeInputPrecision(props) {
  let inputPrecision = props.inputPrecision
  if (!_.isNumber(inputPrecision)) {
    // set this for Math.max
    inputPrecision = null
    for (let point of props.calibration.points) {
      if (_.isNumber(point.x)) {
        inputPrecision = Math.max(inputPrecision, autoPrecision(point.x))
      }
    }
    if (!_.isNumber(inputPrecision)) {
      inputPrecision = 3
    }
  }
  return inputPrecision
}

export class NumPoints extends Component {
  static defaultProps = {
    onNext() {},
    onNumPointsChange() {}
  };
  onNumPointsChange = event => this.props.onNumPointsChange(event.target.value);
  onKeyDown = e => {
    if (e.key === 'Enter' && NumPoints.validate(this.props).valid) {
      this.props.onNext()
    }
  };
  componentDidAppear() {
    this.componentDidEnter()
  }
  componentDidEnter() {
    this._numPoints.focus()
  }
  static validate(props) {
    const {calibration, maxNumPoints} = props
    const numPoints = calibration.get('numPoints')

    if (isEmptyValue(numPoints)) {
      return {numPoints: {warning: 'Please enter a number to continue'}, valid: false}
    }
    if (!isValidNumPoints(numPoints)) {
      return {numPoints: {error: `'${numPoints}' is not a valid number`}, valid: false}
    }
    const value = parseInt(numPoints)
    if (value < 2) {
      return {numPoints: {error: 'Number of points must be >= 2.'}, valid: false}
    }
    if (value > maxNumPoints) {
      return {numPoints: {error: 'Number of points must be <= ' + maxNumPoints}, valid: false}
    }
    return {valid: true}
  }
  render() {
    const {calibration, onNumPointsChange, onEditManuallyClick} = this.props
    const numPoints = calibration.get('numPoints')

    const validation = NumPoints.validate(this.props)

    return <div className="mf-calibration-num-points-step">
      <p key="instructions">Enter the number of calibration points you would like to enter:</p>
      <p key="number" className={classNames('form-group', validationClassNames(validation.numPoints))}>
        <label className="control-label">Number of points:&nbsp;</label>
        <input type="text" ref={c => this._numPoints = c} className="form-control" inputMode="number"
            value={numPoints} onChange={onNumPointsChange} onKeyDown={this.onKeyDown}
        />
      </p>
      <AlertGroup alerts={validation} />
      <p>or <Button onClick={onEditManuallyClick}>Edit Manually</Button></p>
    </div>
  }
}

export class Point extends Component {
  static defaultProps = {
    onOutputValueChange() {},
    onNext() {}
  };
  onOutputValueChange = event => {
    let {pointIndex, onOutputValueChange} = this.props
    onOutputValueChange(pointIndex, event.target.value)
  };
  onKeyDown = e => {
    if (e.key === 'Enter' && Point.validate(this.props).valid) {
      this.props.onNext()
    }
  };
  componentDidAppear() {
    this.componentDidEnter()
  }
  componentDidEnter() {
    this._outputValue.focus()
  }
  static validate(props) {
    const {pointIndex, calibration} = props
    const outputValue = calibration.getIn(['points', pointIndex, 'y'])

    if (!isValidOutputValueOrBlank(outputValue)) {
      return {outputValue: {error: `'${outputValue}' is not a valid number`}, valid: false}
    }
    return {valid: true}
  }
  render() {
    const {pointIndex, calibration, calibrationState} = this.props
    const points = calibration.get('points')
    const inputValue = calibrationState.getIn(['input', 'value'])
    const inputUnits = calibrationState.getIn(['input', 'units'])
    const outputValue = calibration.getIn(['points', pointIndex, 'y'])
    const outputUnits = calibrationState.getIn(['output', 'units'])

    const validation = Point.validate(this.props)

    let inputPrecision = computeInputPrecision(this.props)

    let stateType = pointIndex === 0 ? 'low' : pointIndex === points.size - 1 ? 'high' : undefined

    let fixedInputValue
    if (_.isNumber(inputValue)) {
      fixedInputValue = inputValue.toFixed(inputPrecision)
    }

    return <div className="mf-calibration-point-step">
      <h3 key="header">Step {pointIndex + 1}</h3>
      <p key="instructions">Go to a known {stateType} state, and enter the actual value.</p>
      <div key="table" className="table">
        <div key="input" className="input">
          <div key="header" className="header">Raw Value</div>
          <div key="value" className="value">
            <input type="text" className="form-control" value={fixedInputValue} readOnly /> {inputUnits}
          </div>
        </div>
        <div key="output" className={classNames("output", "form-group", validationClassNames(validation.outputValue))}>
          <div key="header" className="header control-label">Actual Value</div>
          <div key="value" className="value">
            <input type="text" ref={c => this._outputValue = c} className="form-control" inputMode="number"
                value={outputValue} onChange={this.onOutputValueChange} onKeyDown={this.onKeyDown}
            /> {outputUnits}
          </div>
        </div>
      </div>
      <AlertGroup alerts={validation} />
    </div>
  }
}

function isEmpty(value) {
  return value === '' || value === undefined || value === null || isNaN(value)
}

export class Confirm extends Component {
  static defaultProps = {
    onInputValueChange() {},
    onOutputValueChange() {},
    onAddPoint() {},
    onDeletePoint() {}
  };
  _inputTextfields = [];
  _outputTextfields = [];
  componentWillMount() { this._mounted = true }
  componentWillUnmount() { this._mounted = false }
  onBlur = pointIndex => {
    setTimeout(() => {
      if (!this._mounted) return
      const {calibration, onDeletePoint} = this.props
      const point = calibration.getIn(['points', pointIndex])
      if (document.activeElement !== this._inputTextfields [pointIndex] &&
          document.activeElement !== this._outputTextfields[pointIndex] &&
          isEmpty(point.get('x'), point.get('y'))) {
        onDeletePoint(pointIndex)
      }
    }, 17)
  };
  static validate(props) {
    const {calibration} = props
    const points = calibration.get('points')

    let invalidValue
    points && points.forEach(point => {
      const x = point.get('x')
      const y = point.get('y')
      if (!isValidInputValueOrBlank(x)) {
        invalidValue = x
        return false
      }
      if (!isValidOutputValueOrBlank(y)) {
        invalidValue = y
        return false
      }
    })

    if (invalidValue !== undefined) {
      return {points: {error: `'${invalidValue}' is not a valid number`}, valid: false}
    }

    const validCount = points.count(point => {
      const x = point.get('x')
      const y = point.get('y')
      return isValidInputValue(x) && isValidOutputValue(y)
    })

    if (validCount < 2) {
      return {points: {error: 'Please enter values for at least two points'}, valid: false}
    }

    return {valid: true}
  }
  render() {
    const {calibration, calibrationState, onInputValueChange, onOutputValueChange,
      onDeletePoint, onAddPoint} = this.props
    const points = calibration.get('points')
    const inputUnits = calibrationState.getIn(['input', 'units'])
    const outputUnits = calibrationState.getIn(['output', 'units'])

    const validation = Confirm.validate(this.props)

    let rows = points && _.compact(points.toArray().map((point, index) => {
      const x = point.get('x')
      const y = point.get('y')
      const inputClass  = classNames('inputValue',  {'has-error': !isValidInputValueOrBlank(x)})
      const outputClass = classNames('outputValue', {'has-error': !isValidOutputValueOrBlank(y)})
      return <tr key={index} className="values">
        <td className={inputClass}>
          <input type="text" className="form-control" value={x} ref={c => this._inputTextfields[index] = c}
              onChange={e => onInputValueChange(index, e.target.value)} onBlur={() => this.onBlur(index)}
          />
        </td>
        <td className={outputClass}>
          <input type="text" className="form-control" value={y} ref={c => this._outputTextfields[index] = c}
              onChange={e => onOutputValueChange(index, e.target.value)} onBlur={() => this.onBlur(index)}
          />
        </td>
        <td className="delete">
          <Button onClick={e => onDeletePoint(index)} tabIndex={-1}>
            <i className="glyphicon glyphicon-trash" />
          </Button>
        </td>
      </tr>
    })).concat(<tr key={points.size} className="values">
      <td className="inputValue">
        <input type="text" className="form-control" value=""
            onChange={e => onAddPoint({x: e.target.value})}
        />
      </td>
      <td className="outputValue">
        <input type="text" className="form-control" value=""
            onChange={e => onAddPoint({y: e.target.value})}
        />
      </td>
    </tr>)

    return <div className="mf-calibration-confirm-step">
      <h3 key="header">Confirm Calibration</h3>
      <p key="instructions">You may edit the values below:</p>
      <table key="table">
        <tbody>
          <tr key="header" className="header">
            <td key="input" className="inputValue">Raw Value ({inputUnits})</td>
            <td key="output" className="outputValue">Actual Value ({outputUnits})</td>
          </tr>
          {rows}
        </tbody>
      </table>
      <AlertGroup alerts={validation} />
    </div>
  }
}
