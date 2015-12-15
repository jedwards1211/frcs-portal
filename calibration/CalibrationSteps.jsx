import React, {Component, PropTypes} from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { integerRegExp, numberOrBlankRegExp } from '../utils/validationRegExps';

import Alert from '../bootstrap/Alert';
import Autocollapse from '../common/Autocollapse';

import {NEXT, SET_NUM_POINTS, SET_OUTPUT_VALUE} from './calibrationActions';

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

export class NumPoints extends Component {
  static defaultProps = {
    dispatch: function() {},
  }
  onNumPointsChange = event => {
    this.props.dispatch({
      type: SET_NUM_POINTS,
      payload: event.target.value
    });
  }
  onKeyDown = e => {
    const {calibration, maxNumPoints, dispatch} = this.props;
    const numPoints = calibration.get('numPoints');
    if (isValidNumPoints(numPoints, maxNumPoints) && e.key === 'Enter') {
      dispatch({type: NEXT});
    }
  }
  componentDidAppear() {
    this.componentDidEnter();
  }
  componentDidEnter() {
    this._numPoints.focus();
  }
  render() {
    const {calibration, maxNumPoints} = this.props;
    const numPoints = calibration.get('numPoints');

    let invalidMessage = invalidNumPointsMessage(numPoints, maxNumPoints);

    return <div className="mf-calibration-num-points-step">
      <p key="instructions">Enter the number of calibration points you would like to enter:</p>
      <p key="number" className={classNames('form-group', {'has-error': !!invalidMessage})}>
        <label className="control-label">Number of points:&nbsp;</label>
        <input type="text" ref={c => this._numPoints = c} className="form-control" inputMode="number"
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

export class Point extends Component {
  static defaultProps = {
    dispatch: function() {},
  }
  onOutputValueChange = event => {
    let {dispatch, pointIndex} = this.props;
    dispatch({
      type: SET_OUTPUT_VALUE,
      payload: event.target.value,
      meta: {
        pointIndex,
      },
    });
  }
  onKeyDown = e => {
    const {calibration, pointIndex, dispatch} = this.props;
    if (isValidOutputValue(calibration.getIn(['points', pointIndex, 'y'])) && e.key === 'Enter') {
      dispatch({type: NEXT});
    }
  }
  componentDidAppear() {
    this.componentDidEnter();
  }
  componentDidEnter() {
    this._outputValue.focus();
  }
  render() {
    const {pointIndex, calibration, inputValue, inputUnits, outputUnits} = this.props;
    const numPoints = calibration.get('numPoints');
    const outputValue = calibration.getIn(['points', pointIndex, 'y']);

    let inputPrecision = computeInputPrecision(this.props);

    let stateType = pointIndex === 0 ? 'low' : pointIndex === numPoints - 1 ? 'high' : undefined;

    let fixedInputValue;
    if (_.isNumber(inputValue)) {
      fixedInputValue = inputValue.toFixed(inputPrecision);
    }

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
            <input type="text" ref={c => this._outputValue = c} className="form-control" inputMode="number" 
              value={outputValue} onChange={this.onOutputValueChange} onKeyDown={this.onKeyDown}/> {outputUnits}
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
  render() {
    const {calibration, inputUnits, outputUnits} = this.props;
    const points = calibration.get('points');

    let inputPrecision = computeInputPrecision(this.props);
    let outputPrecision = computeOutputPrecision(this.props);

    let rows = points && _.compact(points.toArray().map((point, index) => {
      const x = Number(point.get('x'));
      const y = Number(point.get('y'));
      if (_.isNumber(x) && !isNaN(x) && _.isNumber(y) && !isNaN(y)) {
        return <tr key={index} className="values">
          <td key="input" className="inputValue">{x.toFixed(inputPrecision)}</td>
          <td key="output" className="outputValue">{y.toFixed(outputPrecision)}</td>
        </tr>;
      }
    }));

    return <div className="mf-calibration-confirm-step">
      <h3 key="header">Step {points.size + 1}</h3>
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
