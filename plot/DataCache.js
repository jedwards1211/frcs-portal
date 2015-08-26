import {EventEmitter} from 'events';

import * as GridMath from './GridMath';
import CachePage from './CachePage';
import LinkedList from './LinkedList';

import {floorIndex, ceilingIndex, lowerIndex, higherIndex} from './precisebs';

export default class DataCache extends EventEmitter {
  /**
   * Constructs a DataCache.
   * @param{pageRange} the page range to use (difference between beginTime and endTime
   * for each page).
   */
  constructor(options) {
    super();
    this.dataSource = options.dataSource;
    this.pageRange = options.pageRange;
    this.maxPages = options.maxPages;
    this.data = {};
    this.recentPages = new LinkedList();
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
    var endTime = beginTime + this.pageRange;
    var pages = this.data[channelId];
    if (!pages) {
      if (!fetch) return;
      pages = this.data[channelId] = {};
    }
    var page = pages[beginTime];
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
        if (this.dataSource) {
          page.promise = this.dataSource.query({channelId, beginTime, endTime}).then(this.replaceData);
        }
      }
    }
    else {
      if (touch && page.node) {
        // mark the mage most recently used
        page.node.moveToHead();
      }
      if (fetch && this.dataSource && page.isMerged && Date.now() >= page.endTime * 1000) {
        // re-request this page, in case any realtime data points are missing
        // or have slight differences from what got into historical data
        page.promise = this.dataSource.query({channelId, beginTime, endTime}).then(this.replaceData);
      }
    }
    return page;
  }

  replaceData = (newPage) => {
    // TODO figure out why newPage is sometimes undefined
    if (!newPage) return;

    var {channelId, beginTime, endTime} = newPage;
    var pages = this.data[channelId];
    if (pages) {
      var page = pages[beginTime];
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
        delete page.isMerged;
        this.emit('dataChange', {channels: [channelId], beginTime, endTime});
      }
    }
  }

  removePage(page) {
    var {channelId, beginTime, endTime} = page;
    var pages = this.data[channelId];
    if (page.node) page.node.remove();
    if (page.promise && page.promise.isPending()) page.promise.cancel();
    if (pages) {
      if (page === pages[beginTime]) {
        delete pages[beginTime];
      }
    }
  }

  removeExcessPendingPages() {
    var node = this.recentPages.tail;
    for (var i = this.recentPages.size; i > this.maxPages; i--) {
      var page = node.elem;
      var prev = node.prev;
      if (page.isPending) {
        this.removePage(page);
      }
      node = prev;
    }
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
    var fromAdj = (surround ? GridMath.modLower  : GridMath.modFloor  )(from, this.pageRange);
    var toAdj   = (surround ? GridMath.modHigher : GridMath.modCeiling)(to  , this.pageRange);

    var pageStart = fromAdj;
    var pageEnd = pageStart + this.pageRange;

    while (pageStart < toAdj) {
      var page = this.getPage(channelId, pageStart, touch);

      if (page) {
        // determine where to start and end within the page, in case from and to fall within the page.
        // we want to return from the greatest value less than {from} to the least value greater than {to}.
        var startIndex = pageStart === fromAdj ?
          Math.max(0, (surround ? lowerIndex : floorIndex)(page.times, from))
          :
          0;

        var endIndex = pageEnd === toAdj ?
          Math.min(page.times.length - 1,
            (surround ? higherIndex : lowerIndex)(page.times, to, startIndex, page.times.length - 1))
          :
          page.times.length - 1;

        for (var i = startIndex; i <= endIndex; i++) {
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
    var fromAdj = (surround ? GridMath.modLower  : GridMath.modFloor  )(from, this.pageRange);
    var toAdj   = (surround ? GridMath.modHigher : GridMath.modCeiling)(to  , this.pageRange);

    var pageStart = fromAdj;
    var pageCount = 0;

    // mark all existing pages within the range as most recently used
    while (pageStart < toAdj && pageCount < this.maxPages) {
      for (var i = 0; i < channelIds.length && pageCount < this.maxPages; i++) {
        if (this.getPage(channelIds[i], pageStart, true)) pageCount++;
      }
      pageStart += this.pageRange;
    } 

    pageStart = fromAdj;
    pageCount = 0;

    // now fetch pages that are missing
    while (pageStart < toAdj && pageCount < this.maxPages) {
      for (var i = 0; i < channelIds.length && pageCount++ < this.maxPages; i++) {
        this.getPage(channelIds[i], pageStart, true, true);
      }
      pageStart += this.pageRange;
    } 

    this.removeExcessPendingPages();
  }

  // STUFF TO REWORK LATER

  // addOrMergePage(newPage) {
  //   var pages = this.getPagesFor(newPage.channelId);

  //   var mergePage = pages[newPage.beginTime];
  //   if (mergePage) {
  //     if (newPage.times.length === 0) {
  //       return;
  //     }

  //     mergePage.tailMerge(newPage);
  //   } else {
  //     // mergePage = pages[newPage.beginTime] = newPage;
  //     this.addOrReplacePage(newPage);
  //   }
  //   mergePage.isMerged = true;
  // }

  // fetchLatestData() {
  //   var params = {};
  //   if (this.lastFetchedData && this.lastFetchedData.endTime) {
  //     params.beginTime = this.lastFetchedData.endTime;
  //   }
  //   if(this.dataSource) {
  //     this.dataSource.query(params, this.fetchLatestDataComplete.bind(this, params.beginTime));
  //   }
  // }

  // fetchLatestDataComplete(beginTime, rawData) {
  //   this.lastFetchedData = rawData;
  //   var channelId, channelData;

  //   if (this.lastFetchedData.realTimeData) {
  //     this.emit('realTimeDataReceived');
  //   }

  //   var historical = rawData.historicalData;
  //   if (!historical) {
  //     return;
  //   }

  //   if (isNaN(beginTime)) {

  //     // default to the earliest time among the data points in the response
  //     for (channelId in historical) {
  //       if (historical.hasOwnProperty(channelId)) {
  //         channelData = historical[channelId];
  //         if (channelData && channelData.t && channelData.t.length) {
  //           if (isNaN(beginTime)) {
  //             beginTime = channelData.t[0];
  //           } else {
  //             beginTime = Math.min(beginTime, channelData.t[0]);
  //           }
  //         }
  //       }
  //     }

  //     // no data points in the response?
  //     if (isNaN(beginTime)) {
  //       return;
  //     }
  //   }

  //   var dataWasAdded = false;

  //   for (channelId in historical) {
  //     if (historical.hasOwnProperty(channelId)) {
  //       channelData = historical[channelId];
  //       if (channelData && channelData.t && channelData.t.length && channelData.v) {
  //         var newPages = new CachePage(channelId, beginTime, rawData.endTime,
  //           channelData.t, channelData.v).chunk(this.pageRange);

  //         if (newPages.length > 0) {
  //           dataWasAdded = true;

  //           this.addOrMergePage(newPages[0]);

  //           for (var i = 1; i < newPages.length; i++) {
  //             this.addOrReplacePage(newPages[i]);
  //           }
  //         }
  //       }
  //     }
  //   }

  //   if (dataWasAdded) {
  //     this.emit('dataAdded', {channels: Object.keys(historical), beginTime, endTime: rawData.endTime});
  //   }

  //   if(this.metadataModCount !== rawData.metadataModCount) {
  //     this.emit('metadataChange');
  //     this.metadataModCount = rawData.metadataModCount;
  //   }
  // }

  // turnOnRealTimeDataFetch(delay) {
  //   if (!this.intervalPromise) {
  //     this.intervalPromise = setInterval(this.fetchLatestData.bind(this), delay);
  //   }
  // }

  // turnOffRealTimeDataFetch() {
  //   if (this.intervalPromise) {
  //     clearInterval(this.intervalPromise);
  //     delete this.intervalPromise;
  //   }
  // }

  // getLastRealTimeData(channelId) {
  //   try {
  //     return {
  //       t: this.lastFetchedData.realTimeData[channelId].t,
  //       v: this.lastFetchedData.realTimeData[channelId].v
  //     };
  //   } catch(err) {
  //     return undefined;
  //   }
  // }
}