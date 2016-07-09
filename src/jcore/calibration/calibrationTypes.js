/* @flow */

import * as Immutable from 'immutable'

export type DefaultProps = {
  onBack: Function,
  onNext: Function,
  onApply: Function,
  onCancel: Function,
  onAddPoint: (point: {x?: string | number, y?: string}) => any,
  onDeletePoint: (pointIndex: number) => any,
  onNumPointsChange: (numPoints: string) => any,
  onInputValueChange: (pointIndex: number, inputValue: string) => any,
  onOutputValueChange: (pointIndex: number, outputValue: string) => any,
  onEditManuallyClick: Function,
  maxNumPoints: number,
  calibrationState: Immutable.Map,
  applying?: boolean,
  applyError?: Error,
}

export type Props = DefaultProps & {
  className?: string,
  isFocused?: boolean,
  stepNumber?: number | 'numPoints' | 'confirm',
  calibration: Immutable.Map,
  inputPrecision?: number,
  outputPrecision?: number,
}

export const defaultProps = {
  onBack() {},
  onNext() {},
  onApply() {},
  onCancel() {},
  onAddPoint() {},
  onDeletePoint() {},
  onNumPointsChange() {},
  onEditManuallyClick() {},
  onInputValueChange() {},
  onOutputValueChange() {},
  maxNumPoints: 20,
  calibrationState: Immutable.Map(),
}
