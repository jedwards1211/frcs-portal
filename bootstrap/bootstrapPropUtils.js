/* @flow */

import {getEnumProp} from '../utils/propUtils'

import type {FormValidation} from '../flowtypes/validationTypes'

import _ from 'lodash'

export const CONTEXT_CLASSES = {
  alarm:    'danger',
  error:    'danger',
  danger:   'danger',
  warning:  'warning',
  info:     'info',
  success:  'success',
  ok:       'success',
  primary:  'primary',
}

export const FORM_GROUP_CONTEXT_CLASSES = {
  error:    'has-error',
  warning:  'has-warning',
  success:  'has-success'
}

export const SHADE_CLASSES = {
  brighter: 'shade-brighter',
  darker:   'shade-darker',
}

export const SIZING_CLASSES = {
  sm: 'sm',
  small: 'sm',
  lg: 'lg',
  large: 'lg',
  xs: 'xs',
  extraSmall: 'xs',
}

export function getContextClass(props: Object): ?string {
  return getEnumProp(props, CONTEXT_CLASSES, 'contextClass')
}

export function getFormGroupContextClass(props: Object): ?string {
  return getEnumProp(props, FORM_GROUP_CONTEXT_CLASSES, 'contextClass')
}

export function getShadeClass(props: Object): ?string {
  return getEnumProp(props, SHADE_CLASSES, 'shade')
}

export function getSizingClass(props: Object): ?string {
  return getEnumProp(props, SIZING_CLASSES, 'sizing')
}

function nontrue(val: ?any) {
  return val === true ? undefined : val
}

export function getContextContent(props: Object): ?any {
  if (CONTEXT_CLASSES[props.contextClass]) return nontrue(props[props.contextClass])
  for (let contextClass in CONTEXT_CLASSES) {
    let value = props[contextClass]
    if (value) return nontrue(value)
  }
}

export function getValidationContextClass(validation: FormValidation): ?string {
  let props = {}
  _.forEach(validation, field => {
    if (field instanceof Object) Object.assign(props, field)
  })
  return getContextClass(props)
}
