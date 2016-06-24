import {expect} from 'chai'
import {relativeTimeString} from '../../dateUtils'

describe('dateUtils', function() {
  describe('relativeTimeString', function() {
    it('works for just now', function() {
      expect(relativeTimeString(1000, {anchorTime: 1999})).to.equal('just now')
    })
    it('works for one second ago', function() {
      expect(relativeTimeString(1000, {anchorTime: 2999})).to.equal('one second ago')
    })
    it('works for 3 seconds ago', function() {
      expect(relativeTimeString(1000, {anchorTime: 4999})).to.equal('3 seconds ago')
    })
    it('works for one minute ago', function() {
      expect(relativeTimeString(new Date('01/01/2015 23:59:00'), {anchorTime: new Date('01/02/2015 00:00:59')}))
        .to.equal('one minute ago')
    })
    it('works for 59 minutes ago', function() {
      expect(relativeTimeString(new Date('01/01/2015 23:01:00'), {anchorTime: new Date('01/02/2015 00:00:00')}))
        .to.equal('59 minutes ago')
    })
    it('works for one hour ago', function() {
      expect(relativeTimeString(new Date('01/01/2015 22:01:00'), {anchorTime: new Date('01/02/2015 00:00:59')}))
        .to.equal('one hour ago')
    })
    it('works for 23 hours ago', function() {
      expect(relativeTimeString(new Date('01/01/2015 00:00:01'), {anchorTime: new Date('01/02/2015 00:00:00')}))
        .to.equal('23 hours ago')
    })
    it('works for yesterday', function() {
      expect(relativeTimeString(new Date('01/01/2015 00:00:00'), {anchorTime: new Date('01/02/2015 00:00:00')}))
        .to.equal('yesterday')
    })
    it('works for last X', function() {
      expect(relativeTimeString(new Date('01/01/2015 00:00:00'), {anchorTime: new Date('01/08/2015 23:59:59')}))
        .to.equal('last Thursday')
    })
    it('works for more distant dates', function() {
      expect(relativeTimeString(new Date('01/01/2015 00:00:00'), {anchorTime: new Date('01/09/2015 00:00:00')}))
        .to.equal(new Date('01/01/2015').toDateString())
    })
  })
})
