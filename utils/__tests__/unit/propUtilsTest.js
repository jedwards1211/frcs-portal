import {expect} from 'chai'
import {getEnumProp} from '../../propUtils'
import _ from 'lodash'

describe('getEnumProp', () => {
  let constants = _.keyBy(['left', 'right', 'up', 'down'], _.identity)
  it('(without shortcutProp): returns first truthy prop', () => {
    expect(getEnumProp({up: true, right: false, down: true}, constants)).to.equal('up')
  })
  it('(with shortcutProp): returns the shortcut prop if present', () => {
    expect(getEnumProp({up: true, side: 'down'}, constants, 'side')).to.equal('down')
  })
  it('(with shortcutProp): returns the first truthy prop if the shortcut prop is not present', () => {
    expect(getEnumProp({up: true, right: false, down: true}, constants, 'side')).to.equal('up')
  })
  it('(with shortcutProp): returns the first truthy prop if the shortcut prop is invalid', () => {
    expect(getEnumProp({up: true, right: false, down: true, side: 'blargh'},
      constants, 'side')).to.equal('up')
  })
  it('returns undefined if nothing in the constants is found', () => {
    expect(getEnumProp({hello: 'world'}, constants, 'side')).to.equal(undefined)
  })
  it('returns undefined if the props are empty', () => {
    expect(getEnumProp({}, constants, 'side')).to.equal(undefined)
  })
  it('returns value if different from key', () => {
    expect(getEnumProp({up: true, right: false, down: true}, {left: 'a', right: 'b', up: 'c', down: 'd'})).to.equal('c')
    expect(getEnumProp({up: true, side: 'down'}, {left: 'a', right: 'b', up: 'c', down: 'd'}, 'side')).to.equal('d')
  })
})
