import * as andyplot from './andyplot';

export default class CachePage {
  constructor(beginTime, endTime, times, values) {
    if (endTime <= beginTime) {
      throw new Error(`beginTime (${beginTime}) must be > endTime(${endTime})`);
    }
    if (times.length !== values.length) {
      throw new Error(`times.length (${times.length}) must be === values.length(${values.length})`);
    }
    this.beginTime = beginTime;
    this.endTime = endTime;
    this.times = times;
    this.values = values;
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

    var beginTime = andyplot.modFloor(this.beginTime, chunkDuration);
    var endTime = beginTime + chunkDuration;

    var fromIndex = 0;

    while (beginTime <= this.times[this.times.length - 1]) {
      var splitIndex = andyplot.ceilingIndex(this.times, endTime, fromIndex, this.times.length - 1);
      result.push(new CachePage(
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

  /**
   * Replaces all data in this page on or after the given page's beginTime with
   * data in the given page.
   * @param{pageToMerge} the page to merge into this one, whose beginTime, endTime,
   * and times should be contained within this page's beginTime and endTime.
   */
  tailMerge(pageToMerge) {
    if (pageToMerge.beginTime < this.beginTime ||
      pageToMerge.endTime > this.endTime) {

      throw new Error('pageToMerge (beginTime: ' + pageToMerge.beginTime +
        ', endTime: ' + pageToMerge.endTime +
        ') spans outside of this page (beginTime: ' + this.beginTime +
        ', endTime: ' + this.endTime);
    }

    var mergeIndex = andyplot.binarySearch(this.times, pageToMerge.times[0]);
    this.times .splice(mergeIndex, this.times .length - mergeIndex, ...pageToMerge.times );
    this.values.splice(mergeIndex, this.values.length - mergeIndex, ...pageToMerge.values);
  }
}