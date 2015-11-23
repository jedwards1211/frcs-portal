import React, {Component, PropTypes} from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { integerRegExp, numberOrBlankRegExp } from '../utils/validationRegExps';

import Alert from '../bootstrap/Alert';
import Autocollapse from '../common/Autocollapse';

import {NEXT} from './CalibrationWizardButtons';

import './CalibrationSteps.sass';

function autoPrecision(value) {
  value = Math.abs(value);
  if (value < 10) {
    return 3;
  }
  if (value < 100) {
    return 2;
  }
  if (value < 1000) {
    return 1;
  }
  return 0;
}

function computeInputPrecision(props) {
  let inputPrecision = props.inputPrecision;
  if (!_.isNumber(inputPrecision)) {
    // set this for Math.max
    inputPrecision = null;
    for (let point of props.calibration.points) {
      if (_.isNumber(point.x)) {
        inputPrecision = Math.max(inputPrecision, autoPrecision(point.x));
      }
    }
    if (!_.isNumber(inputPrecision)) {
      inputPrecision = 3;
    }
  }
  return inputPrecision;
}

function computeOutputPrecision(props) {
  let outputPrecision = props.outputPrecision;
  if (!_.isNumber(outputPrecision)) {
    // set this for Math.max
    outputPrecision = null;
    for (let point of props.calibration.points) {
      if (_.isNumber(point.y)) {
        outputPrecision = Math.max(outputPrecision, autoPrecision(point.y));
      }
    }
    if (!_.isNumber(outputPrecision)) {
      outputPrecision = 3;
    }
  }
  return outputPrecision;
}

export function isValidNumPoints(numPoints, maxNumPoints) {
  let parsed = parseInt(numPoints);
  return integerRegExp.test(numPoints) &&
    parsed >= 2 && parsed <= maxNumPoints;
}

function invalidNumPointsMessage(numPoints, maxNumPoints) {
  if (!integerRegExp.test(numPoints)) {
    return 'Please enter a valid number before continuing.';
  }

  let value = parseInt(numPoints);
  if (value < 2) {
    return 'Number of points must be >= 2.';
  }
  if (value > maxNumPoints) {
    return 'Number of points must be <= ' + maxNumPoints;
  }
}

export const stringOrNumber = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number
]);

export const NUM_POINTS_CHANGE = 'NUM_POINTS_CHANGE';

export class NumPoints extends Component {
  static propTypes = {
    calibration: PropTypes.shape({
      numPoints: stringOrNumber,
    }).isRequired,
    maxNumPoints: PropTypes.number.isRequired,
    dispatch: PropTypes.func
  }
  static defaultProps = {
    dispatch: function() {},
  }
  onNumPointsChange = event => {
    this.props.dispatch({
      type: NUM_POINTS_CHANGE,
      payload: event.target.value
    });
  }
  onKeyDown = e => {
    let {calibration: {numPoints}, maxNumPoints, dispatch} = this.props;
    if (isValidNumPoints(numPoints, maxNumPoints) && e.key === 'Enter') {
      dispatch({type: NEXT});
    }
  }
  render() {
    let {calibration: {numPoints}, maxNumPoints} = this.props;

    let invalidMessage = invalidNumPointsMessage(numPoints, maxNumPoints);

    return <div className="mf-calibration-num-points-step">
      <p key="instructions">Enter the number of calibration points you would like to enter:</p>
      <p key="number" className={classNames('form-group', {'has-error': !!invalidMessage})}>
        <label className="control-label">Number of points:&nbsp;</label>
        <input type="text" ref="numPoints" className="form-control" inputMode="number"
               value={numPoints} onChange={this.onNumPointsChange} onKeyDown={this.onKeyDown}/>
      </p>
      <Autocollapse component="div">
        {invalidMessage && <Alert.Danger>{invalidMessage}</Alert.Danger>}
      </Autocollapse>
    </div>;
  }
}

export function isValidOutputValue(outputValue) {
  return outputValue === undefined || numberOrBlankRegExp.test(outputValue);
}

export const OUTPUT_VALUE_CHANGE = 'OUTPUT_VALUE_CHANGE';

export class Point extends Component {
  static propTypes = {
    pointIndex: PropTypes.number.isRequired,
    calibration: PropTypes.shape({
      numPoints: stringOrNumber,
      points: PropTypes.arrayOf(PropTypes.shape({
        y: stringOrNumber,
      }).isRequired).isRequired,
    }).isRequired,
    inputValue: PropTypes.number,
    inputUnits: PropTypes.string,
    inputPrecision: PropTypes.number,
    outputUnits: PropTypes.string,
    dispatch: PropTypes.func,
  }
  static defaultProps = {
    dispatch: function() {},
  }
  onOutputValueChange = event => {
    let {dispatch, pointIndex} = this.props;
    dispatch({
      type: OUTPUT_VALUE_CHANGE,
      payload: event.target.value,
      meta: {
        pointIndex,
      },
    });
  }
  onKeyDown = e => {
    let {calibration: {points}, pointIndex, dispatch} = this.props;
    if (isValidOutputValue(points[pointIndex].y) && e.key === 'Enter') {
      dispatch({type: NEXT});
    }
  }
  render() {
    let {pointIndex, calibration: {points, numPoints}, inputValue, inputUnits, outputUnits} = this.props;

    let inputPrecision = computeInputPrecision(this.props);

    let stateType = pointIndex === 0 ? 'low' : pointIndex === numPoints - 1 ? 'high' : undefined;

    let fixedInputValue;
    if (_.isNumber(inputValue)) {
      fixedInputValue = inputValue.toFixed(inputPrecision);
    }

    let outputValue = points[pointIndex].y;

    let hasError = !isValidOutputValue(outputValue);

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
        <div key="output" className={classNames("output", "form-group", {'has-error': hasError})}>
          <div key="header" className="header control-label">Actual Value</div>
          <div key="value" className="value">
            <input type="text" ref="outputValue" className="form-control" inputMode="number" value={outputValue}
              onChange={this.onOutputValueChange} /> {outputUnits}
          </div>
        </div>
      </div>
      <Autocollapse component="div">
        {hasError && <Alert.Danger>
          Please enter a valid number before continuing.
        </Alert.Danger>}
      </Autocollapse>
    </div>;
  }
}

export class Confirm extends Component {
  static propTypes = {
    calibration: PropTypes.shape({
      points: PropTypes.arrayOf(PropTypes.shape({
        x: PropTypes.number,
        y: stringOrNumber,
      }).isRequired).isRequired,
    }).isRequired,
    inputUnits: PropTypes.string,
    outputUnits: PropTypes.string,
    inputPrecision: PropTypes.number,
    outputPrecision: PropTypes.number
  }
  render() {
    let {calibration: {points}, inputUnits, outputUnits} = this.props;

    let inputPrecision = computeInputPrecision(this.props);
    let outputPrecision = computeOutputPrecision(this.props);

    let rows = points && _.compact(points.map((point, index) => {
      let x = Number(point.x);
      let y = Number(point.y);
      if (_.isNumber(x) && !isNaN(x) && _.isNumber(y) && !isNaN(y)) {
        return <tr key={index} className="values">
          <td key="input" className="inputValue">{x.toFixed(inputPrecision)}</td>
          <td key="output" className="outputValue">{y.toFixed(outputPrecision)}</td>
        </tr>;
      }
    }));

    return <div className="mf-calibration-confirm-step">
      <h3 key="header">Step {points.length + 1}</h3>
      <p key="instructions">Confirm the calibration:</p>
      <table key="table">
        <tbody>
          <tr key="header" className="header">
            <td key="input" className="inputValue">Raw Value ({inputUnits})</td>
            <td key="output" className="outputValue">Actual Value ({outputUnits})</td>
          </tr>
          {rows}
        </tbody>
      </table>
    </div>;
  }
}
