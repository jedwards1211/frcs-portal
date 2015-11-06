import {EventEmitter} from 'events';

import _ from 'lodash';

import * as GridMath from './GridMath';
import CachePage from './CachePage';
import LinkedList from './LinkedList';
import Promise from 'bluebird';

import {floorIndex, ceilingIndex, lowerIndex, higherIndex} from './precisebs';

import {forEach} from 'lodash';

export default class DataCache extends EventEmitter {
  /**
   * Constructs a DataCache.
   * @param{object}   options.dataSource - provider of raw data without any caching
   * @param{function} options.dataSource.query - if present, function taking argument
   *                  ({channelId, beginTime, endTime}) and returning a promise to be fulfilled with
   *                  the CachePage
   * @param{function} options.dataSource.subscribe - if present, function taking arguments
   *                  ({channelId, beginTime, endTime}, {onData, onError}) and returning an unsubscribe function
   * @param{number}   options.pageRange - the page range to use (difference between beginTime and endTime
   * for each page).
   *
   */
  constructor(options) {
    super();
    this.dataSource = options.dataSource;
    this.pageRange = options.pageRange;
    this.maxPages = options.maxPages;
    this.data = {};
    this.recentPages = new LinkedList();
    // map from channel id => begin time of latest page
    this.latestPageBeginTimes = {};
  }

  /**
   * Gets a page of data from the cache.
   * @param {string|number} channelId - the channel id
   * @param {number}        beginTime - the beginTime of the page
   * @param {boolean}       touch     - if true and the page exists (or fetch) it will be marked 
   *                                    most recently used
   * @param {boolean}       fetch     - if true and the page does not exist, a placeholder page
   *                                    will be created an data fetched for it
   */
  getPage(channelId, beginTime, touch, fetch) {
    let endTime = beginTime + this.pageRange;
    let pages = this.data[channelId];
    if (!pages) {
      if (!fetch) return;
      pages = this.data[channelId] = {};
    }
    let page = pages[beginTime];
    if (!page) {
      if (fetch) {
        // add a placeholder page so we can track it in the most recently used queue
        page = pages[beginTime] = new CachePage(channelId, beginTime, endTime, [beginTime], [NaN]);
        // mark the page pending.  This way replaceData will know the data it receives is initial
        // rather than updated
        page.isPending = true;
        if (touch) {
        // mark the mage most recently used
          page.node = this.recentPages.prepend(page);
        }
        if (this.dataSource && this.dataSource.query) {
          page.promise = this.dataSource.query({channelId, beginTime, endTime}).then(this.replaceData);
        }
      }
    }
    else {
      if (touch && page.node) {
        // mark the mage most recently used
        page.node.moveToHead();
      }
      if (fetch && this.dataSource && this.dataSource.query &&
        page.isMerged && Date.now() >= page.endTime * 1000) {
        // re-request this page, in case any realtime data points are missing
        // or have slight differences from what got into historical data
        page.promise = this.dataSource.query({channelId, beginTime, endTime}).then(this.replaceData);
      }
    }
    return page;
  }

  replaceData = (newPage, notify) => {
    // TODO figure out why newPage is sometimes undefined
    if (!newPage) return;

    let {channelId, beginTime, endTime} = newPage;
    let pages = this.data[channelId];
    let changed = false;
    if (pages) {
      for (let time = GridMath.modCeiling(beginTime, this.pageRange); time < endTime; time += this.pageRange) {
        let page = pages[beginTime];
        if (page) {
          // eject an old page if we just got data for a placeholder page and the cache is full
          if (page.isPending && this.recentPages.size > this.maxPages) {
            // remove excess pending pages first...
            this.removeExcessPendingPages();
            // ... to guarantee that this removed page has data
            this.removePage(this.recentPages.tail.elem);
          }
          page.replaceData(newPage);
          delete page.isPending;
          if (beginTime <= page.beginTime && endTime >= page.endTime) {
            delete page.isMerged;
          }
          changed = true;
        }
      }
    }
    if (changed && notify !== false) {
      this.emit('dataChange', {channels: {[channelId]: true}, beginTime, endTime});
    }
  }

  mergeData = (pageWithNewData, notify) => {
    if (!pageWithNewData || !pageWithNewData.times.length) return;

    let chunks = pageWithNewData.chunk(this.pageRange);

    for (let i = 0; i < chunks.length; i++) {
      let chunk = chunks[i];
      let {channelId, beginTime, times, values} = chunk;
      let pages = this.data[channelId];
      if (pages) {
        let page = pages[beginTime];
        if (!page || (i > 0 && i < chunks.length - 1)) {
          if (!page) {
            page = pages[beginTime] = chunk;
            page.node = this.recentPages.prepend(page);
            if (this.dataSource && this.dataSource.query) {
              page.promise = Promise.resolve();
            }
          }
          else {
            this.replaceData(chunk);
          }
        }
        else {
          let firstTime  = times[0];
          let lastTime   = times[times.length - 1];
          let startIndex = ceilingIndex(page.times, firstTime);
          let endIndex   = floorIndex  (page.times, lastTime );
          let count      = endIndex + 1 - startIndex;

          page.times .splice(startIndex, count, ...times);
          page.values.splice(startIndex, count, ...values);
          page.isMerged = true;

          if ('production' !== process.env.NODE_ENV) page.sanityCheck();

          if (notify !== false) {
            this.emit('dataChange', {channels: {[channelId]: true}, beginTime: firstTime, endTime: lastTime});
          }
        }
      }
    }
  }

  removePage(page) {
    let {channelId, beginTime} = page;
    let pages = this.data[channelId];
    if (page.node) page.node.remove();
    if (page.promise && page.promise.isPending()) page.promise.cancel();
    if (pages) {
      if (page === pages[beginTime]) {
        delete pages[beginTime];
        if (beginTime === this.getLatestPageBeginTime(channelId)) {
          delete this.latestPageBeginTimes[channelId];
        }
      }
    }
  }

  removeExcessPendingPages() {
    let node = this.recentPages.tail;
    for (let i = this.recentPages.size; i > this.maxPages; i--) {
      let page = node.elem;
      let prev = node.prev;
      if (page.isPending) {
        this.removePage(page);
      }
      node = prev;
    }
  }

  getLatestPageBeginTime(channelId) {
    if (!(channelId in this.latestPageBeginTimes) && channelId in this.data) {
      let beginTime = 0;
      forEach(this.data[channelId], page => {
        if (!page.isPending && page.times.length) beginTime = Math.max(beginTime, page.beginTime);
      });
      if (beginTime === 0) {
        return undefined;
      }
      this.latestPageBeginTimes[channelId] = beginTime;
    }
    return this.latestPageBeginTimes[channelId];
  }

  fetchLatestData(channelIds) {
    let channels = {}, minBeginTime, maxEndTime;
    return Promise.settle(channelIds.map(channelId => {
      let beginTime = this.getLatestPageBeginTime(channelId);
      if (beginTime) {
        let page = this.getPage(channelId, beginTime);
        if (page) {
          let lastTime = page.times[page.times.length - 1];
          return this.dataSource.query({channelId, beginTime: lastTime}).then(page => {
            let pageEndTime = page.endTime || page.times[page.times.length - 1];
            if (!minBeginTime || page.beginTime < minBeginTime) minBeginTime = page.beginTime;
            if (!maxEndTime   || pageEndTime    > maxEndTime  ) maxEndTime   = pageEndTime;
            channels[page.channelId] = true;
            this.replaceData(page, false);
          });
        }
      }
      return Promise.resolve();
    })).then(() => {
      if (minBeginTime && maxEndTime) {
        this.emit('dataChange', {channels, beginTime: minBeginTime, endTime: maxEndTime});
      }
    });
  }

  /**
   * Gets channel data.
   *
   * @param{channelId} the id of the channel to get data for.
   * @param{from} the start time of the range to get.
   * @param{to} the end time of the range to get.
   * @param{surround} if truthy, points from the greatest time less than <code>from</code> to
   *      the least time greater than <code>to</code> will be returned.  Otherwise, points in
   *      the range [from, to) will be returned.
   * @param{consumer} a function that will be called with arguments <code>(time, value)</code>
   *      for each successive point in the results.  The first point and last point may lie just
   *      outside the request range.
   * @param{touch} whether to touch the pages in the given range, marking them as most recently
   *      used and possibly ejecting old pages.
   */
  get(channelId, from, to, surround, consumer, touch) {
    let fromAdj = (surround ? GridMath.modLower  : GridMath.modFloor  )(from, this.pageRange);
    let toAdj   = (surround ? GridMath.modHigher : GridMath.modCeiling)(to  , this.pageRange);

    let pageStart = fromAdj;
    let pageEnd = pageStart + this.pageRange;

    while (pageStart < toAdj) {
      let page = this.getPage(channelId, pageStart, touch);

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
          consumer(page.times[i], page.values[i]);
        }
      }
      else {
        // pass a NaN value so that non-adjacent pages don't get connected by a straight line
        consumer(pageStart, NaN);
      }

      pageStart = pageEnd;
      pageEnd += this.pageRange;
    }
  }

  /**
   * Marks data in the given range as most recently used, and begins fetching any data missing
   * from the range.  May eject old pages if the cache is or becomes full.
   */
  touch(channelIds, from, to, surround) {
    let beginTime = (surround ? GridMath.modLower  : GridMath.modFloor  )(from, this.pageRange);
    let endTime   = (surround ? GridMath.modHigher : GridMath.modCeiling)(to  , this.pageRange);

    let pageStart = beginTime;
    let pageCount = 0;

    // mark all existing pages within the range as most recently used
    while (pageStart < endTime && pageCount < this.maxPages) {
      for (let i = 0; i < channelIds.length && pageCount < this.maxPages; i++) {
        if (this.getPage(channelIds[i], pageStart, true)) pageCount++;
      }
      pageStart += this.pageRange;
    } 

    pageStart = beginTime;
    pageCount = 0;

    // now fetch pages that are missing
    while (pageStart < endTime && pageCount < this.maxPages) {
      for (let i = 0; i < channelIds.length && pageCount++ < this.maxPages; i++) {
        this.getPage(channelIds[i], pageStart, true, true);
      }
      pageStart += this.pageRange;
    }

    if (this.dataSource && this.dataSource.subscribe) {
      this.resubscribe(channelIds, beginTime, endTime);
		}

    this.removeExcessPendingPages();
  }

  resubscribe = _.throttle((channelIds, beginTime, endTime) => {
    if (this._unsubscribe) {
      this._unsubscribe();
    }
    this._unsubscribe = this.dataSource.subscribe({channelIds, beginTime, endTime}, {
      onData: (page) => {
        this.mergeData(page, true);
      },
    });
  }, 1000);
}
