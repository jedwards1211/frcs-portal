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

export function getContextClass(props: Object): ?string {
  return getEnumProp(props, CONTEXT_CLASSES, 'contextClass');
}

export function getContextContent(props: Object): ?any {
  if (props.contextClass) return props[props.contextClass];
  for (let contextClass in CONTEXT_CLASSES) {
    let value = props[contextClass];
    if (value === true) return undefined;
    else if (value) return value;
  }
}
