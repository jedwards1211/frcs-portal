import React, {Component, PropTypes} from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { integerRegExp, numberOrBlankRegExp } from '../utils/validationRegExps';

import Alert from '../bootstrap/Alert';
import Autocollapse from '../common/Autocollapse';
import Button from '../bootstrap/Button';

import {NEXT, SET_NUM_POINTS, setInputValue, setOutputValue, 
        addPoint, deletePoint} from './calibrationActions';

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
    dispatch(setOutputValue(pointIndex, event.target.value));
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
    const {pointIndex, calibration, calibrationState} = this.props;
    const numPoints = calibration.get('numPoints');
    const inputValue = calibrationState.getIn(['input', 'value']);
    const inputUnits = calibrationState.getIn(['input', 'units']);
    const outputValue = calibration.getIn(['points', pointIndex, 'y']);
    const outputUnits = calibrationState.getIn(['output', 'units']);

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
    const {calibration, calibrationState, dispatch} = this.props;
    const points = calibration.get('points');
    const inputUnits = calibrationState.getIn(['input', 'units']);
    const outputUnits = calibrationState.getIn(['output', 'units']);

    let rows = points && _.compact(points.toArray().map((point, index) => {
      const x = point.get('x');
      const y = point.get('y');
      const inputClass  = classNames('inputValue',  {'has-error': !isValidOutputValue(x)});
      const outputClass = classNames('outputValue', {'has-error': !isValidOutputValue(y)});
      return <tr key={index} className="values">
        <td className={inputClass}>
          <input type="text" className="form-control" value={x}
            onChange={e => dispatch(setInputValue(index, e.target.value))}/>
        </td>
        <td className={outputClass}>
          <input type="text" className="form-control" value={y}
            onChange={e => dispatch(setOutputValue(index, e.target.value))}/>
        </td>
        <td className="delete">
          <Button onClick={e => dispatch(deletePoint(index))}>
            <i className="glyphicon glyphicon-trash"/>
          </Button>
        </td>
      </tr>;
    })).concat(<tr key={points.size} className="values">
      <td className="inputValue">
        <input type="text" className="form-control" value=""
          onChange={e => dispatch(addPoint({x: e.target.value}))}/>
      </td>
      <td className="outputValue">
        <input type="text" className="form-control" value=""
          onChange={e => dispatch(addPoint({y: e.target.value}))}/>
      </td>
    </tr>);

    return <div className="mf-calibration-confirm-step">
      <h3 key="header">Step {points.size + 1}</h3>
      <p key="instructions">Confirm or edit the calibration:</p>
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
