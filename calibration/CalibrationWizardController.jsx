import React, {Component, PropTypes} from 'react';
import _ from 'lodash';

import {
  NUM_POINTS_CHANGE,
  OUTPUT_VALUE_CHANGE,
  stringOrNumber,
} from './CalibrationSteps';

import {
  BACK,
  NEXT,
  APPLY,
} from './CalibrationWizardButtons';

export const CANCEL_CALIBRATION = 'CANCEL_CALIBRATION';
export const APPLY_CALIBRATION = 'APPLY_CALIBRATION';
export const REQUEST_PROP_CHANGE = 'REQUEST_PROP_CHANGE';

export default class CalibrationWizardController extends Component {
  static propTypes = {
    skipNumPoints: PropTypes.bool,
    calibration: PropTypes.shape({
      numPoints: stringOrNumber,
      points: PropTypes.arrayOf(PropTypes.shape({
        x: PropTypes.number,
        y: stringOrNumber,
      }).isRequired).isRequired,
    }).isRequired,
    stepNumber: PropTypes.number.isRequired,
    inputValue: PropTypes.number,
    inputUnits: PropTypes.string,
    inputPrecision: PropTypes.number,
    outputUnits: PropTypes.string,
    outputPrecision: PropTypes.number,
    dispatch: React.PropTypes.func,
    component: React.PropTypes.any.isRequired,
  }
  static defaultProps = {
    dispatch: e => console.log(e),
  }
  dispatch = e => {
    let {dispatch, calibration} = this.props;

    switch (e.type) {
      case NUM_POINTS_CHANGE:
        calibration = _.cloneDeep(calibration);
        calibration.numPoints = e.payload;
        return dispatch({
          type: REQUEST_PROP_CHANGE,
          payload: {calibration},
        });

      case OUTPUT_VALUE_CHANGE:
        calibration = _.cloneDeep(calibration);
        calibration.points[e.meta.pointIndex].y = e.payload;
        return dispatch({
          type: REQUEST_PROP_CHANGE,
          payload: {calibration},
        });

      case BACK:
        return this.onBack();

      case NEXT:
        return this.onNext();

      case APPLY:
        return this.onApply();
    }
  }
  onBack() {
    let {skipNumPoints, stepNumber, inputValue, calibration, dispatch} = this.props;
    let firstStep = skipNumPoints ? 1 : 0;
    if (stepNumber === firstStep) {
      dispatch({type: CANCEL_CALIBRATION});
    }
    else if (stepNumber === calibration.numPoints + 1) {
      dispatch({
        type: REQUEST_PROP_CHANGE,
        payload: {stepNumber: stepNumber - 1},
      });
    }
    else {
      let pointIndex = stepNumber - 1;
      calibration = _.cloneDeep(calibration);
      calibration.points[pointIndex].x = inputValue;
      dispatch({
        type: REQUEST_PROP_CHANGE,
        payload: {
          stepNumber: stepNumber - 1,
          calibration,
        },
      });
    }
  }
  onNext() {
    let {stepNumber, calibration, inputValue, dispatch} = this.props;
    calibration = _.cloneDeep(calibration);
    if (stepNumber === 0) {
      let oldNumPoints = calibration.points.length;
      calibration.points.length = calibration.numPoints;
      for (let k = oldNumPoints; k < calibration.numPoints; k++) {
        calibration.points[k] = {
          x: undefined,
          y: undefined
        };
      }
    }
    else {
      let pointIndex = stepNumber - 1;
      let point = calibration.points[pointIndex];
      point.x = inputValue;
    }
    dispatch({
      type: REQUEST_PROP_CHANGE,
      payload: {
        stepNumber: stepNumber + 1,
        calibration,
      },
    });
  }
  onApply() {
    let {calibration, dispatch} = this.props;
    calibration = _.cloneDeep(calibration);
    let goodPoints = [];
    for (let point of calibration.points) {
      let x = parseFloat(point.x);
      let y = parseFloat(point.y);

      if (_.isNumber(x) && !isNaN(x) && _.isNumber(y) && !isNaN(y)) {
        goodPoints.push({
          x: x,
          y: y
        });
      }
    }
    calibration.points = goodPoints;
    dispatch({
      type: APPLY_CALIBRATION,
      payload: calibration,
    });
  }
  render() {
    let Component = this.props.component;
    return <Component {...this.props} dispatch={this.dispatch}/>;
  }
}
