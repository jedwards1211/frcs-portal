/* @flow */

import {getEnumProp} from '../utils/propUtils';

export const CONTEXT_CLASSES = {
  alarm:    'danger',
  error:    'danger',
  danger:   'danger',
  warning:  'warning',
  info:     'info',
  success:  'success',
  ok:       'success',
  primary:  'primary',
};

export const SHADE_CLASSES = {
  brighter: 'shade-brighter',
  darker:   'shade-darker',
}

export const SIZING_CLASSES = {
  sm: 'sm',
  small: 'sm',
  lg: 'lg',
  large: 'lg'
};

export function getContextClass(props: Object): ?string {
  return getEnumProp(props, CONTEXT_CLASSES, 'contextClass');
}

export function getShadeClass(props: Object): ?string {
  return getEnumProp(props, SHADE_CLASSES, 'shade');
}

export function getSizingClass(props: Object): ?string {
  return getEnumProp(props, SIZING_CLASSES, 'sizing');
}

function nontrue(val: ?any) {
  return val === true ? undefined : val;
}

export function getContextContent(props: Object): ?any {
  if (CONTEXT_CLASSES[props.contextClass]) return nontrue(props[props.contextClass]);
  for (let contextClass in CONTEXT_CLASSES) {
    let value = props[contextClass];
    if (value) return nontrue(value);
  }
}
