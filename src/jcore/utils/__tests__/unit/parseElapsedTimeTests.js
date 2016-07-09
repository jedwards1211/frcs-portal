import parseElapsedTime from '../../parseElapsedTime'

function time({h, m, s, S}) {
  return (h || 0) * 3600000 + (m || 0) * 60000 + (s || 0) * 1000 + (S || 0)
}

describe('parseElapsedTime', () => {
  it ('returns NaN for invalid cases', () => {
    expect(isNaN(parseElapsedTime(''))).toBe(true)
    expect(isNaN(parseElapsedTime('0'))).toBe(true)
    expect(isNaN(parseElapsedTime('12'))).toBe(true)
    expect(isNaN(parseElapsedTime('12:60'))).toBe(true)
    expect(isNaN(parseElapsedTime('12:6'))).toBe(true)
    expect(isNaN(parseElapsedTime('12:20:60'))).toBe(true)
    expect(isNaN(parseElapsedTime('12:20:6'))).toBe(true)
    expect(isNaN(parseElapsedTime('12::60'))).toBe(true)
    expect(isNaN(parseElapsedTime('12:20:30.'))).toBe(true)
    expect(isNaN(parseElapsedTime('12:20:.123'))).toBe(true)
  })
  it ('works for hh:mm', () => {
    expect(parseElapsedTime('1:33')).toBe(time({h: 1, m: 33}))
    expect(parseElapsedTime('12:33')).toBe(time({h: 12, m: 33}))
    expect(parseElapsedTime('144:33')).toBe(time({h: 144, m: 33}))
  })
  it ('works for hh:mm:ss', () => {
    expect(parseElapsedTime('1:33:22')).toBe(time({h: 1, m: 33, s: 22}))
    expect(parseElapsedTime('12:33:22')).toBe(time({h: 12, m: 33, s: 22}))
    expect(parseElapsedTime('144:33:22')).toBe(time({h: 144, m: 33, s: 22}))
  })
  it ('works for hh:mm:ss.SSS', () => {
    expect(parseElapsedTime('1:33:22.1')).toBe(time({h: 1, m: 33, s: 22, S: 100}))
    expect(parseElapsedTime('12:33:22.44')).toBe(time({h: 12, m: 33, s: 22, S: 440}))
    expect(parseElapsedTime('144:33:22.555')).toBe(time({h: 144, m: 33, s: 22, S: 555}))
  })
})
