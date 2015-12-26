import React, {Component} from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { integerRegExp } from '../utils/validationRegExps';

import Alert from '../bootstrap/Alert';
import Autocollapse from '../common/Autocollapse';
import Button from '../bootstrap/Button';

import CollapseTransitionGroup from '../transition/CollapseTransitionGroup';

import {NEXT, SET_NUM_POINTS, GO_TO_EDIT_MANUALLY, setInputValue, setOutputValue, 
        addPoint, deletePoint} from './calibrationActions';

import {isValidNumPoints, isValidInputValue, isValidOutputValue, 
  isValidInputValueOrBlank, isValidOutputValueOrBlank} from './calibrationValidation';

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
    const {calibration, maxNumPoints, dispatch} = this.props;
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
      <p>or <Button onClick={() => dispatch({type: GO_TO_EDIT_MANUALLY})}>Edit Manually</Button></p>
    </div>;
  }
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
    const points = calibration.get('points');
    const inputValue = calibrationState.getIn(['input', 'value']);
    const inputUnits = calibrationState.getIn(['input', 'units']);
    const outputValue = calibration.getIn(['points', pointIndex, 'y']);
    const outputUnits = calibrationState.getIn(['output', 'units']);

    let inputPrecision = computeInputPrecision(this.props);

    let stateType = pointIndex === 0 ? 'low' : pointIndex === points.size - 1 ? 'high' : undefined;

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

function isEmpty(value) {
  return value === '' || value === undefined || value === null || isNaN(value);
}

export class Confirm extends Component {
  _inputTextfields  = [];
  _outputTextfields = [];
  componentWillMount() { this._mounted = true; }
  componentWillUnmount() { this._mounted = false; }
  onBlur = pointIndex => {
    setTimeout(() => {
      if (!this._mounted) return;
      const {calibration, dispatch} = this.props;
      const point = calibration.getIn(['points', pointIndex]);
      if (document.activeElement !== this._inputTextfields [pointIndex] &&
          document.activeElement !== this._outputTextfields[pointIndex] &&
          isEmpty(point.get('x'), point.get('y'))) {
        dispatch(deletePoint(pointIndex));
      }
    }, 17);
  }
  static validate(props) {
    const {calibration} = props;
    const points = calibration.get('points');

    if (points && points.find(point => {
      const x = point.get('x');
      const y = point.get('y');
      return !isValidInputValueOrBlank(x) || !isValidOutputValueOrBlank(y);
    })) {
      return {points: 'Please fix the invalid values in the table'};
    }

    const validCount = points.count(point => {
      const x = point.get('x');
      const y = point.get('y');
      return isValidInputValue(x) && isValidOutputValue(y);
    });

    if (validCount < 2) {
      return {points: 'Please enter values for at least two points'};
    }
  }
  render() {
    const {calibration, calibrationState, dispatch} = this.props;
    const points = calibration.get('points');
    const inputUnits = calibrationState.getIn(['input', 'units']);
    const outputUnits = calibrationState.getIn(['output', 'units']);

    const validation = Confirm.validate(this.props);

    let rows = points && _.compact(points.toArray().map((point, index) => {
      const x = point.get('x');
      const y = point.get('y');
      const inputClass  = classNames('inputValue',  {'has-error': !isValidInputValue (x)});
      const outputClass = classNames('outputValue', {'has-error': !isValidOutputValue(y)});
      return <tr key={index} className="values">
        <td className={inputClass}>
          <input type="text" className="form-control" value={x} ref={c => this._inputTextfields[index] = c}
            onChange={e => dispatch(setInputValue(index, e.target.value))} onBlur={() => this.onBlur(index)}/>
        </td>
        <td className={outputClass}>
          <input type="text" className="form-control" value={y} ref={c => this._outputTextfields[index] = c}
            onChange={e => dispatch(setOutputValue(index, e.target.value))} onBlur={() => this.onBlur(index)}/>
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
      <CollapseTransitionGroup component="div">
        {validation && Object.keys(validation).map(key => {
          const error = validation[key];
          return <Alert.Danger key={key}>{error}</Alert.Danger>;
        })}
      </CollapseTransitionGroup>
    </div>;
  }
}
