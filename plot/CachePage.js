import {modFloor} from './GridMath'

import {ceilingIndex} from './precisebs'

export default class CachePage {
  constructor(channelId, beginTime, endTime, times, values) {
    if (endTime <= beginTime) {
      throw new Error(`beginTime (${beginTime}) must be > endTime (${endTime})`)
    }
    if (times.length !== values.length) {
      throw new Error(`times.length (${times.length}) must be === values.length (${values.length})`)
    }
    this.channelId = channelId
    this.beginTime = beginTime
    this.endTime = endTime
    this.times = times
    this.values = values

    if ('production' !== process.env.NODE_ENV) this.sanityCheck()
  }

  sanityCheck() {
    if ('production' !== process.env.NODE_ENV) {
      /* eslint-disable no-inner-declarations */
      function SanityCheckError(message, cachePage, timeIndex) {
        let result = new Error(message)
        result.cachePage = cachePage
        result.timeIndex = timeIndex
        return result
      }
      function logSanityCheckError(error) {
        /* eslint-disable no-console */
        let {cachePage, timeIndex} = error
        let {times, values} = cachePage
        console.error(error)
        console.log(error.cachePage)
        if (console.table && timeIndex) {
          var table = []
          times.forEach((time, index) => {
            if (Math.abs(index - timeIndex) <= 2) {
              table[index] = {time: index === timeIndex ? time + '***' : time, value: values[index]}
            }
          })
          console.table(table, ['time', 'value'])
        }
        /* eslint-enable no-console */
      }
      /* eslint-enable no-inner-declarations */

      try {
        let {beginTime, endTime, times, values} = this
        if (endTime <= beginTime) {
          throw SanityCheckError(`beginTime (${beginTime}) must be > endTime (${endTime})`, this)
        }
        if (times.length !== values.length) {
          throw SanityCheckError(`times.length (${times.length}) must be === values.length (${values.length})`,
            this, Math.min(times.length, values.length))
        }
        if (times.length) {
          if (times[0] < beginTime) {
            throw SanityCheckError(`times[0] (${times[0]}) must be >= beginTime (${beginTime})`, this, 0)
          }
          let last = times.length - 1
          if (times[last] >= endTime) {
            throw SanityCheckError(`last time (${times[last]}) must be < endTime (${endTime})`, this, last)
          }
          for (var i = 1; i < times.length; i++) {
            if (times[i] <= times[i - 1]) {
              throw SanityCheckError(`times[${i}] (${times[i]}) must be > times[${i - 1}] (${times[i - 1]})`, this, i)
            }
          }
        }
      } catch (e) {
        logSanityCheckError(e)
      }
    }
  }

  clone() {
    return new CachePage(this.channelId, this.beginTime, this.endTime,
      this.times.slice(), this.values.slice())
  }

  /**
   * Splits this CachePage into Pages with the given chunkDuration.  The CachePage beginTimes
   * will be zero mod chunkDuration.
   * @param{chunkDuration} the desired duration (between beginTime and endTime) for
   * the pages in the result.
   * @returns an array of Pages split from this page.
   */
  chunk(chunkDuration) {
    var result = []

    var beginTime = modFloor(this.beginTime, chunkDuration)
    var endTime = beginTime + chunkDuration

    var fromIndex = 0

    while (beginTime <= this.times[this.times.length - 1]) {
      var splitIndex = ceilingIndex(this.times, endTime, fromIndex, this.times.length - 1)
      if (splitIndex > fromIndex) {
        result.push(new CachePage(
          this.channelId,
          beginTime,
          endTime,
          this.times.slice(fromIndex, splitIndex),
          this.values.slice(fromIndex, splitIndex)
        ))
      }

      beginTime = endTime
      endTime += chunkDuration
      fromIndex = splitIndex
    }

    return result
  }

  /**
   * Replaces any data in this within the range [page.beginTime, page.endTime)
   * with page's data within the range [this.beginTime, this.endTime).
   *
   * @param{CachePage} page - the source page for replacement.
   * @throws{Error} if page.channelId !== this.channelId.
   */
  replaceData(page) {
    if (page.channelId !== this.channelId) {
      throw new Error("page must have same channelId as this one")
    }
    if (page.beginTime < this.endTime && page.endTime > this.beginTime) {
      if (page.beginTime === this.beginTime && page.endTime === this.endTime) {
        this.times   = page.times
        this.values  = page.values
      }
      else {
        let startIndex = ceilingIndex(this.times, page.beginTime)
        let endIndex   = ceilingIndex(this.times, page.endTime  )
        let count      = endIndex - startIndex

        let srcTimes
        let srcValues
        if (page.beginTime < this.beginTime || page.endTime > this.endTime) {
          // page spans outside of this
          let startIndex = ceilingIndex(page.times, this.beginTime)
          let endIndex   = ceilingIndex(page.times, this.endTime  )
          srcTimes  = page.times .slice(startIndex, endIndex)
          srcValues = page.values.slice(startIndex, endIndex)
        }
        else {
          // page doesn't span outside of this
          srcTimes  = page.times
          srcValues = page.values
        }

        this.times .splice(startIndex, count, ...srcTimes)
        this.values.splice(startIndex, count, ...srcValues)

        if ('production' !== process.env.NODE_ENV) this.sanityCheck()
      }
    }
    return this
  }
}
