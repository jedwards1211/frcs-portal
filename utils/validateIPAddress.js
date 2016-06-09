/* @flow */

import type {GroupValidation} from '../flowtypes/validationTypes'

const ipRx = /^(\d{1,3}(\.\d{1,3}){3}|[a-f0-9]{2}(:[a-f0-9]{2}){7})$/i

export default function validateIPAddress(address: ?string, options?: {
  required?: boolean
} = {}): ?GroupValidation {
  const {required} = options
  address = address && address.trim()

  if (required && !address) return {error: 'Please enter an IP address'}
  if (!required && !address) return

  if (!ipRx.test(address)) return {error: 'Please enter a valid IP address'}
  if (address.indexOf('.') >= 0) {
    const parts = address.split('.')
    for (let part of parts) {
      if (parseInt(part) > 255) return {error: 'Please enter a valid IP address'}
    }
  }
}
