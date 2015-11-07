import {EventEmitter} from 'events';

import _ from 'lodash';

import * as GridMath from './GridMath';
import CachePage from './CachePage';
import LinkedList from './LinkedList';
import Promise from 'bluebird';

import {floorIndex, lowerIndex, higherIndex} from './precisebs';

export default class DataCache extends EventEmitter {
  /**
   * Constructs a DataCache.
   * @param{number}   options.maxPages - the maximum number of pages this data cache will store at one time
   *                  (excluding pending pages)
   * @param{object}   options.dataSource - provider of raw data without any caching
   * @param{function} options.dataSource.query - if present, function taking argument
   *                  ({channelId, beginTime, endTime}) and returning a promise to be fulfilled with
   *                  the CachePage
   * @param{function} options.dataSource.subscribe - if present, function taking arguments
   *                  ({channelId, beginTime, endTime}, {onData, onError}) and returning an unsubscribe function
   * @param{number}   options.pageRange - the page range to use (difference between beginTime and endTime
   *                  for each page).
   *
   */
  constructor(options) {
    super();
    this.dataSource = options.dataSource;
    this.pageRange = options.pageRange;
    this.maxPages = options.maxPages;
    this.modCount = 0;
    this.data = {};
    this.recentPages = new LinkedList();
    // map from channel id => begin time of latest page
    this.latestPageBeginTimes = {};
  }

  /**
   * Gets a page of data from the cache.
   * @param {string|number} channelId     - the channel id
   * @param {number}        beginTime     - the beginTime of the page
   * @param {object}        options
   * @param {boolean}       options.touch - if true and the page exists (or fetch) it will be marked
   *                                        most recently used
   * @param {boolean}       options.fetch - if true and the page does not exist, a placeholder page
   *                                        will be created an data fetched for it
   */
  getPage(channelId, beginTime, options = {}) {
    let {touch, fetch} = options;

    if (touch || fetch) {
      this.modCount++;
    }

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
          // mark the page most recently used
          page.node = this.recentPages.prepend(page);
        }
        if (this.dataSource && this.dataSource.query) {
          page.promise = this.dataSource.query({channelId, beginTime, endTime}).then(this.replaceData);
        }
      }
    }
    else {
      if (touch && page.node) {
        // mark the page most recently used
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

  /**
   * Replaces all data in the cache spanned by the given page.  Ejects old pages if necessary.
   * @param{CachePage} newPage - data to add to this cache
   * @param{object} options
   * @param{boolean} options.emitDataChange - if false, no dataChange event will be emitted, even if
   * data was changed.
   */
  replaceData = (newPage, options = {}) => {
    this.modCount++;

    let {emitDataChange} = options;

    // TODO figure out why newPage is sometimes undefined
    if (!newPage) return;

    let {channelId, beginTime, endTime} = newPage;
    let pages = this.data[channelId];
    let changed = false;
    if (pages) {
      for (let time = GridMath.modFloor(beginTime, this.pageRange); time < endTime; time += this.pageRange) {
        let page = pages[time];
        if (page) {
          page.replaceData(newPage);

          // eject an old page if we just got data for a placeholder page and the cache is full
          if (page.isPending && this.recentPages.size > this.maxPages) {
            // remove excess pending pages first...
            this.removeExcessPendingPages();
            // ...to guarantee that any remaining excess pages have data
            if (this.recentPages.size > this.maxPages) {
              this.removePage(this.recentPages.tail.elem);
            }
          }

          if (beginTime <= page.beginTime && endTime >= page.endTime) {
            delete page.isMerged;
          }
          else if (!page.isPending) {
            page.isMerged = true;
          }
          delete page.isPending;

          changed = true;
        }
      }
    }
    if (changed && emitDataChange !== false) {
      this.emit('dataChange', {channels: {[channelId]: true}, beginTime, endTime});
    }
  };

  removePage(page) {
    this.modCount++;
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
    this.modCount++;
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
      _.forEach(this.data[channelId], page => {
        if (!page.isPending && page.times.length) beginTime = Math.max(beginTime, page.beginTime);
      });
      if (beginTime === 0) {
        return undefined;
      }
      this.latestPageBeginTimes[channelId] = beginTime;
    }
    return this.latestPageBeginTimes[channelId];
  }

  /**
   * Requests data for each of the given channels, beginning at each's last data point time.
   * Does nothing if dataSource.query is falsey.
   * @param{string[]} channelIds - the channelIds to fetch the latest data for
   */
  fetchLatestData(channelIds) {
    if (!this.dataSource.query) {
      return;
    }

    let channels = {}, minBeginTime, maxEndTime;
    return Promise.settle(channelIds.map(channelId => {
      let beginTime = this.getLatestPageBeginTime(channelId);
      // TODO this should probably still do something if there are no pages for the channel
      if (beginTime) {
        let page = this.getPage(channelId, beginTime);
        if (page) {
          let lastTime = page.times[page.times.length - 1] || beginTime;
          return this.dataSource.query({channelId, beginTime: lastTime}).then(page => {
            page.endTime = page.endTime || page.times[page.times.length - 1] + 1;
            if (!minBeginTime || page.beginTime < minBeginTime) minBeginTime = page.beginTime;
            if (!maxEndTime   || page.endTime   > maxEndTime  ) maxEndTime   = page.endTime;
            channels[page.channelId] = true;
            this.replaceData(page, {emitDataChange: false});
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

  /**
   * Marks data in the given range as most recently used, and begins fetching any data missing
   * from the range.  Also updates the subscription if dataSource.subscribe is present.
   * May eject old pages if the cache is or becomes full.
   *
   * @param{string[]} channelIds - the channel ids to mark most recently used
   * @param{number}   from       - the begin time of the range to mark most recently used
   * @param{number}   to         - the end time of the range to mark most recently used
   * @param{object}   options
   * @param{boolean}  options.surround - if truthy, points from the greatest time less than <code>from</code> to
   *      the least time greater than <code>to</code> will be returned.  Otherwise, points in
   *      the range [from, to) will be returned.
   */
  touch(channelIds, from, to, options = {}) {
    this.modCount++;

    let {surround} = options;

    let beginTime = (surround ? GridMath.modLower  : GridMath.modFloor  )(from, this.pageRange);
    let endTime   = (surround ? GridMath.modHigher : GridMath.modCeiling)(to  , this.pageRange);

    let pageStart = beginTime;
    let pageCount = 0;

    // mark all existing pages within the range as most recently used
    while (pageStart < endTime && pageCount < this.maxPages) {
      for (let i = 0; i < channelIds.length && pageCount < this.maxPages; i++) {
        if (this.getPage(channelIds[i], pageStart, {touch: true})) pageCount++;
      }
      pageStart += this.pageRange;
    } 

    pageStart = beginTime;
    pageCount = 0;

    // now fetch pages that are missing
    while (pageStart < endTime && pageCount < this.maxPages) {
      for (let i = 0; i < channelIds.length && pageCount++ < this.maxPages; i++) {
        this.getPage(channelIds[i], pageStart, {touch: true, fetch: true});
      }
      pageStart += this.pageRange;
    }

    this.removeExcessPendingPages();

    // update the subscription if the dataSource supports it
    if (this.dataSource && this.dataSource.subscribe) {
      this.resubscribe(channelIds, beginTime, endTime);
		}
  }

  resubscribe = _.throttle((channelIds, beginTime, endTime) => {
    if (this._unsubscribe) {
      this._unsubscribe();
    }
    let {onData} = this;
    this._unsubscribe = this.dataSource.subscribe({channelIds, beginTime, endTime}, {onData});
  }, 1000);

  /**
   * Callback for dataSource.subscribe.
   * @param{CachePage[]} pages - pages containing new data.  They don't have to
   * line up with existing pages in DataCache.
   */
  onData = (...pages) => {
    // merge in the data
    pages.forEach(page => this.replaceData(page, {emitDataChange: false}));

    // emit one dataChange event for the whole set of pages
    let beginTime = _.max(pages, 'beginTime');
    let endTime   = _.max(pages, 'endTime');
    let channels = {};
    pages.forEach(page => channels[page.channelId] = true);
    this.emit('dataChange', {channels, beginTime, endTime});
  };
}
