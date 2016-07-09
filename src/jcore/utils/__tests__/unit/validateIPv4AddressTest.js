import validateIPv4Address from '../../validateIPv4Address'

const invalidError = {error: 'Please enter a valid IPv4 address'}

describe('validateIPv4Address', () => {
  it('accepts valid IPv4 addresses', () => {
    expect(validateIPv4Address('0.0.0.0')).toBe(undefined)
    expect(validateIPv4Address('192.168.0.1')).toBe(undefined)
    expect(validateIPv4Address('255.255.255.255')).toBe(undefined)
    expect(validateIPv4Address('  \n192.168.0.1 \t')).toBe(undefined)
    expect(validateIPv4Address('255.255.255.255')).toBe(undefined)
  })
  it('rejects invalid IPv4 addresses', () => {
    expect(validateIPv4Address('0')).toEqual(invalidError)
    expect(validateIPv4Address('0.')).toEqual(invalidError)
    expect(validateIPv4Address('0.0')).toEqual(invalidError)
    expect(validateIPv4Address('0.0.')).toEqual(invalidError)
    expect(validateIPv4Address('0.0.0')).toEqual(invalidError)
    expect(validateIPv4Address('0.0.0.')).toEqual(invalidError)
    expect(validateIPv4Address('0.0.0.0.')).toEqual(invalidError)
    expect(validateIPv4Address('.0.0.0.0')).toEqual(invalidError)
    expect(validateIPv4Address('0.0.0.0.0')).toEqual(invalidError)
    expect(validateIPv4Address('0.0.0.256')).toEqual(invalidError)
    expect(validateIPv4Address('0.0.256.0')).toEqual(invalidError)
    expect(validateIPv4Address('0.256.0.0')).toEqual(invalidError)
    expect(validateIPv4Address('256.0.0.0')).toEqual(invalidError)
    expect(validateIPv4Address('999.0.0.0')).toEqual(invalidError)
    expect(validateIPv4Address('192.16a.0.1')).toEqual(invalidError)
    expect(validateIPv4Address('192.168..0.1')).toEqual(invalidError)
    expect(validateIPv4Address('192.168.a.1')).toEqual(invalidError)
    expect(validateIPv4Address('192.168.0.a')).toEqual(invalidError)
    expect(validateIPv4Address('192.168.0.a')).toEqual(invalidError)
    expect(validateIPv4Address('a192.168.0.a')).toEqual(invalidError)
  })
})
