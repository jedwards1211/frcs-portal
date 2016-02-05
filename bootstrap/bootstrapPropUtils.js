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

export function getContextClass(props: Object, shortcutProp: ?string): ?string {
  return  CONTEXT_CLASSES[props.contextClass] ||
          CONTEXT_CLASSES[props[shortcutProp]] ||
          getEnumProp(props, CONTEXT_CLASSES);
}

export function getContextClassValue(props: Object): ?any {
  for (let contextClass in CONTEXT_CLASSES) {
    if (props.hasOwnProperty(contextClass)) {
      let value = props[contextClass];
      return value === true ? undefined : value;
    }
  }
}
