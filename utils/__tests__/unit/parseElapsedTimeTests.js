import {expect} from 'chai'
import parseElapsedTime from '../../parseElapsedTime'

function time({h, m, s, S}) {
  return (h || 0) * 3600000 + (m || 0) * 60000 + (s || 0) * 1000 + (S || 0)
}

describe('parseElapsedTime', () => {
  it ('returns NaN for invalid cases', () => {
    expect(isNaN(parseElapsedTime(''))).to.equal(true)
    expect(isNaN(parseElapsedTime('0'))).to.equal(true)
    expect(isNaN(parseElapsedTime('12'))).to.equal(true)
    expect(isNaN(parseElapsedTime('12:60'))).to.equal(true)
    expect(isNaN(parseElapsedTime('12:6'))).to.equal(true)
    expect(isNaN(parseElapsedTime('12:20:60'))).to.equal(true)
    expect(isNaN(parseElapsedTime('12:20:6'))).to.equal(true)
    expect(isNaN(parseElapsedTime('12::60'))).to.equal(true)
    expect(isNaN(parseElapsedTime('12:20:30.'))).to.equal(true)
    expect(isNaN(parseElapsedTime('12:20:.123'))).to.equal(true)
  })
  it ('works for hh:mm', () => {
    expect(parseElapsedTime('1:33')).to.equal(time({h: 1, m: 33}))
    expect(parseElapsedTime('12:33')).to.equal(time({h: 12, m: 33}))
    expect(parseElapsedTime('144:33')).to.equal(time({h: 144, m: 33}))
  })
  it ('works for hh:mm:ss', () => {
    expect(parseElapsedTime('1:33:22')).to.equal(time({h: 1, m: 33, s: 22}))
    expect(parseElapsedTime('12:33:22')).to.equal(time({h: 12, m: 33, s: 22}))
    expect(parseElapsedTime('144:33:22')).to.equal(time({h: 144, m: 33, s: 22}))
  })
  it ('works for hh:mm:ss.SSS', () => {
    expect(parseElapsedTime('1:33:22.1')).to.equal(time({h: 1, m: 33, s: 22, S: 100}))
    expect(parseElapsedTime('12:33:22.44')).to.equal(time({h: 12, m: 33, s: 22, S: 440}))
    expect(parseElapsedTime('144:33:22.555')).to.equal(time({h: 144, m: 33, s: 22, S: 555}))
  })
})
