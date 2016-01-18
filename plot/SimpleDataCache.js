import {EventEmitter} from 'events';

import _ from 'lodash';

import * as GridMath from './GridMath';
import CachePage from './CachePage';

import {floorIndex, lowerIndex, higherIndex} from './precisebs';

export default class SimpleDataCache extends EventEmitter {
  /**
   * Constructs a DataCache.
   * @param{number}   options.pageRange - the page range to use (difference between beginTime and endTime
   *                  for each page).
   *
   */
  constructor(options) {
    super();
    this.pageRange = options.pageRange;
    this.modCount = 0;
    this.data = {};
  }

  /**
   * Gets a page of data from the cache.
   * @param {string|number} channelId     - the channel id
   * @param {number}        beginTime     - the beginTime of the page
   */
  getPage(channelId, beginTime) {
    let pages = this.data[channelId];
    return pages && pages[beginTime];
  }

  /**
   * Replaces all data in the cache spanned by the given page.  Ejects old pages if necessary.
   * @param{CachePage|CachePage[]} newPages - data to add to this cache
   * @param{object} options
   * @param{boolean} options.emitDataChange - if false, no dataChange event will be emitted, even if
   * data was changed.
   */
  replaceData = (newPages, options = {}) => {
    this.modCount++;

    let {emitDataChange} = options;

    // TODO figure out why newPage is sometimes undefined
    if (!newPages) return;

    if (!_.isArray(newPages)) {
      newPages = [newPages];
    }

    if (!newPages.length) {
      return;
    }

    let changed = false;

    for (let newPage of newPages) {
      let {channelId, beginTime, endTime} = newPage;
      let pages = this.data[channelId];
      if (!pages) {
        pages = this.data[channelId] = {};
      }
      for (let time = GridMath.modFloor(beginTime, this.pageRange); time < endTime; time += this.pageRange) {
        let page = pages[time];
        if (!page) {
          page = pages[time] = new CachePage(channelId, time, time + this.pageRange, [time], [NaN]);
        }
        page.replaceData(newPage);

        if (beginTime <= page.beginTime && endTime >= page.endTime) {
          delete page.isMerged;
        }
        else if (!page.isPending) {
          page.isMerged = true;
        }

        changed = true;
      }
    }

    if (changed && emitDataChange !== false) {
      let beginPage = _.max(newPages, 'beginTime');
      let endPage   = _.max(newPages, 'endTime');
      let beginTime = beginPage && beginPage.beginTime;
      let endTime   = endPage   && endPage  .endTime;
      let channels = {};
      newPages.forEach(page => channels[page.channelId] = true);

      this.emit('dataChange', {channels, beginTime, endTime});
    }
  };

  removePagesBesides(channelIds, beginTime, endTime) {
    if (channelIds instanceof Array) {
      let channelIdMap = {};
      channelIds.forEach(id => channelIdMap[id] = true);
      channelIds = channelIdMap;
    }
    for (var channelId in this.data) {
      let pages = this.data[channelId];
      if (!channelIds[channelId]) {
        delete this.data[channelId];
      }
      else {
        for (var time in pages) {
          let page = pages[time];
          if (page.beginTime >= endTime || page.endTime <= beginTime) delete pages[time];
        }
      }
    }
  }

  /**
   * Gets channel data.
   *
   * @param {string} channelId - id of the channel to get data for.
   * @param {number} from - the start time of the range to get.
   * @param {number} to - the end time of the range to get.
   * @param {function} consumer - a function that will be called with arguments <code>(time, value)</code>
   *      for each successive point in the results.  The first point and last point may lie just
   *      outside the request range.
   * @param {object} options
   * @param {boolean} options.surround - if truthy, points from the greatest time less than <code>from</code> to
   *      the least time greater than <code>to</code> will be returned.  Otherwise, points in
   *      the range [from, to) will be returned.
   *
   * @throws Error if the cache is modified between two calls to next() on an iterator returned
   *      by this method.
   */
  *get(channelId, from, to, options = {}) {
    let {surround} = options;

    let fromAdj = (surround ? GridMath.modLower  : GridMath.modFloor  )(from, this.pageRange);
    let toAdj   = (surround ? GridMath.modHigher : GridMath.modCeiling)(to  , this.pageRange);

    let pageStart = fromAdj;
    let pageEnd = pageStart + this.pageRange;

    let modCount = this.modCount;

    let point = {
      t: NaN,
      v: NaN,
    };

    while (pageStart < toAdj) {
      let page = this.getPage(channelId, pageStart);

      if (page) {
        // determine where to start and end within the page, in case from and to fall within the page.
        // we want to return from the greatest value less than {from} to the least value greater than {to}.
        let startIndex = pageStart === fromAdj ?
          Math.max(0, (surround ? lowerIndex : floorIndex)(page.times, from))
          :
          0;

        let endIndex = pageEnd === toAdj ?
          Math.min(page.times.length - 1,
            (surround ? higherIndex : lowerIndex)(page.times, to, startIndex, page.times.length - 1))
          :
          page.times.length - 1;

        for (let i = startIndex; i <= endIndex; i++) {
          point.t = page.times [i];
          point.v = page.values[i];
          yield point;
          if (modCount !== this.modCount) {
            throw new Error('cache has been modified since last call to next()');
          }
        }
      }
      else {
        // pass a NaN value so that non-adjacent pages don't get connected by a straight line
        point.t = pageStart;
        point.v = NaN;
        yield point;
        if (modCount !== this.modCount) {
          throw new Error('cache has been modified since last call to next()');
        }
      }

      pageStart = pageEnd;
      pageEnd += this.pageRange;
    }
  }
}
