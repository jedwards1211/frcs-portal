import * as GridMath from './GridMath';

import {binarySearch, ceilingIndex} from './precisebs';

export default class CachePage {
  constructor(channelId, beginTime, endTime, times, values) {
    if (endTime <= beginTime) {
      throw new Error(`beginTime (${beginTime}) must be > endTime (${endTime})`);
    }
    if (times.length !== values.length) {
      throw new Error(`times.length (${times.length}) must be === values.length (${values.length})`);
    }
    this.channelId = channelId;
    this.beginTime = beginTime;
    this.endTime = endTime;
    this.times = times;
    this.values = values;

    if ('production' !== process.env.NODE_ENV) this.sanityCheck();
  }

  sanityCheck() {
    if ('production' !== process.env.NODE_ENV) {
      /* eslint-disable no-inner-declarations */
      function SanityCheckError(message, cachePage, timeIndex) {
        let result = new Error(message);
        result.cachePage = cachePage;
        result.timeIndex = timeIndex;
        return result;
      }
      function logSanityCheckError(error) {
        /* eslint-disable no-console */
        let {cachePage, timeIndex} = error;
        let {times, values} = cachePage;
        console.error(error);
        console.log(error.cachePage);
        if (console.table && timeIndex) {
          var table = [];
          times.forEach((time, index) => {
            if (Math.abs(index - timeIndex) <= 2) {
              table[index] = {time: index === timeIndex ? time + '***' : time, value: values[index]};
            }
          });
          console.table(table, ['time', 'value']);
        }
        /* eslint-enable no-console */
      }
      /* eslint-enable no-inner-declarations */

      try {
        let {beginTime, endTime, times, values} = this;
        if (endTime <= beginTime) {
          throw SanityCheckError(`beginTime (${beginTime}) must be > endTime (${endTime})`, this);
        }
        if (times.length !== values.length) {
          throw SanityCheckError(`times.length (${times.length}) must be === values.length (${values.length})`, 
            this, Math.min(times.length, values.length));
        }
        if (times.length) {
          if (times[0] < beginTime) {
            throw SanityCheckError(`times[0] (${times[0]}) must be >= beginTime (${beginTime})`, this, 0);
          }
          let last = times.length - 1;
          if (times[last] >= endTime) {
            throw SanityCheckError(`last time (${times[last]}) must be < endTime (${endTime})`, this, last);
          }
          for (var i = 1; i < times.length; i++) {
            if (times[i] <= times[i - 1]) {
              throw SanityCheckError(`times[${i}] (${times[i]}) must be > times[${i - 1}] (${times[i - 1]})`, this, i);
            }
          }
        }
      } catch (e) {
        logSanityCheckError(e);
      }
    }
  }

  /**
   * Splits this CachePage into Pages with the given chunkDuration.  The CachePage beginTimes
   * will be zero mod chunkDuration.
   * @param{chunkDuration} the desired duration (between beginTime and endTime) for
   * the pages in the result.
   * @returns an array of Pages split from this page.
   */
  chunk(chunkDuration) {
    var result = [];

    var beginTime = GridMath.modFloor(this.beginTime, chunkDuration);
    var endTime = beginTime + chunkDuration;

    var fromIndex = 0;

    while (beginTime <= this.times[this.times.length - 1]) {
      var splitIndex = ceilingIndex(this.times, endTime, fromIndex, this.times.length - 1);
      result.push(new CachePage(
        this.channelId, 
        beginTime,
        endTime,
        this.times.slice(fromIndex, splitIndex),
        this.values.slice(fromIndex, splitIndex)
      ));

      beginTime = endTime;
      endTime += chunkDuration;
      fromIndex = splitIndex;
    }

    return result;
  }

  replaceData(page) {
    if (page.channelId !== this.channelId ||
        page.beginTime !== this.beginTime ||
        page.endTime   !== this.endTime) {
      throw new Error("page must have same channelId and time range as this one");
    }
    this.times  = page.times;
    this.values = page.values;

    if ('production' !== process.env.NODE_ENV) this.sanityCheck();
  }

  /**
   * Replaces all data in this page on or after the given page's beginTime with
   * data in the given page.
   * @param{pageToMerge} the page to merge into this one, whose beginTime, endTime,
   * and times should be contained within this page's beginTime and endTime.
   */
  tailMerge(pageToMerge) {
    if (pageToMerge.channelId !== this.channelId) {
      throw new Error(`pageToMerge.channelId (${pageToMerge.channelId}) must === this.channelId (${this.channelId})`);
    }
    if (pageToMerge.beginTime < this.beginTime ||
      pageToMerge.endTime > this.endTime) {

      throw new Error('pageToMerge (beginTime: ' + pageToMerge.beginTime +
        ', endTime: ' + pageToMerge.endTime +
        ') spans outside of this page (beginTime: ' + this.beginTime +
        ', endTime: ' + this.endTime);
    }

    var mergeIndex = binarySearch(this.times, pageToMerge.times[0]);
    this.times .splice(mergeIndex, this.times .length - mergeIndex, ...pageToMerge.times );
    this.values.splice(mergeIndex, this.values.length - mergeIndex, ...pageToMerge.values);

    if ('production' !== process.env.NODE_ENV) this.sanityCheck();
  }
}
