/* @flow */

import type {GroupValidation} from '../flowtypes/validationTypes'

import {isValidIPv4Address} from './ipAddressUtils'

export default function validateIPv4Address(address: ?string, options?: {
  required?: boolean
} = {}): ?GroupValidation {
  const required = options.required !== false

  if (address) {
    if (!isValidIPv4Address(address)) return {error: 'Please enter a valid IPv4 address'}
  }
  else if (required) return {error: 'Please enter an IPv4 address'}
}
