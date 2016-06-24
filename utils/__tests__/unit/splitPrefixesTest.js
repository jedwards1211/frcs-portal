import {expect} from 'chai'
import splitPrefixes from '../../splitPrefixes'

describe('splitPrefixes', () => {
  it('works for empty string', () => {
    expect([...splitPrefixes('', ',')]).to.deep.equal([])
    expect([...splitPrefixes('', /,/)]).to.deep.equal([])
  })
  it('works for just sep', () => {
    expect([...splitPrefixes(',', ',')]).to.deep.equal(['', ','])
    expect([...splitPrefixes(',', /,/g)]).to.deep.equal(['', ','])
  })
  it('works for multiple seps', () => {
    expect([...splitPrefixes(',1,2,,,3,4,', ',')]).to.deep.equal(['', ',1', ',1,2', ',1,2,', ',1,2,,', ',1,2,,,3', ',1,2,,,3,4', ',1,2,,,3,4,'])
    expect([...splitPrefixes(',1,2,,,3,4,', /,/g)]).to.deep.equal(['', ',1', ',1,2', ',1,2,', ',1,2,,', ',1,2,,,3', ',1,2,,,3,4', ',1,2,,,3,4,'])
  })
})
