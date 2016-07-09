/* @flow */

export function isValidIPv4Address(address: string): boolean {
  const bytes = address.split('.')
  if (bytes.length !== 4) return false

  for (let byte of bytes) {
    byte = byte.trim()
    if (!byte.length || /\D/.test(byte) || parseInt(byte) > 255) return false
  }

  return true
}

export function normalizeIPv4Address(address: string): string {
  address = address.trim()
  const bytes = address.split('.')
  if (bytes.length !== 4) throw new Error('Invalid IPv4 Address: ' + address)
  return bytes.map(byte => {
    const parsed = parseInt(byte)
    if (!byte.length || /\D/.test(byte) || parsed > 255) throw new Error('Invalid IPv4 Address: ' + address)
    return parsed
  }).join('.')
}
