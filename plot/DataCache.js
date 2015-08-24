import {EventEmitter} from 'events';

import * as andyplot from './andyplot';
import CachePage from './CachePage';

export default class DataCache extends EventEmitter {
  /**
   * Constructs a DataCache.
   * @param{pageRange} the page range to use (difference between beginTime and endTime
   * for each page).
   */
  constructor(dataSource, pageRange) {
    super();
    this.dataSource = dataSource;
    this.pageRange = pageRange;
    this.data = {};
  }

  getPagesFor(channelId) {
    var pages = this.data[channelId];
    if (!pages) pages = this.data[channelId] = {};
    return pages;
  }

  addOrMergePage(channelId, newPage) {
    var pages = this.getPagesFor(channelId);

    var mergePage = pages[newPage.beginTime];
    if (mergePage) {
      if (newPage.times.length === 0) {
        return;
      }

      mergePage.tailMerge(newPage);
    } else {
      mergePage = pages[newPage.beginTime] = newPage;
    }
    mergePage.isMerged = true;
  }

  addOrReplacePage(channelId, newPage) {
    var pages = this.getPagesFor(channelId);
    pages[newPage.beginTime] = newPage;
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
   */
  get(channelId, from, to, surround, consumer) {
    var me = this;

    function queryCallback(channelId, page) {
      me.addOrReplacePage(channelId, page);
      me.emit('dataAdded', {channels: [channelId], beginTime: page.beginTime, endTime: page.endTime});
    }

    var fromAdj = (surround ? andyplot.modLower  : andyplot.modFloor  )(from, this.pageRange);
    var toAdj   = (surround ? andyplot.modHigher : andyplot.modCeiling)(to  , this.pageRange);

    var pages = this.getPagesFor(channelId);

    var pageStart = fromAdj;
    var pageEnd = pageStart + this.pageRange;

    while (pageStart < toAdj) {
      var page = pages[pageStart];

      if (page) {
        if (this.dataSource && page.isMerged && Date.now() >= page.endTime * 1000) {
          // re-request this page, in case any realtime data points are missing
          // or have slight differences from what got into historical data
          this.dataSource.query({
            channelId,
            beginTime: pageStart,
            endTime: pageEnd
          }).then(page => queryCallback(channelId, page));
        }

        // determine where to start and end within the page, in case from and to fall within the page.
        // we want to return from the greatest value less than {from} to the least value greater than {to}.
        var startIndex = pageStart === fromAdj ?
          Math.max(0, (surround ? andyplot.lowerIndex : andyplot.floorIndex)(page.times, from))
          :
          0;

        var endIndex = pageEnd === toAdj ?
          Math.min(page.times.length - 1,
            (surround ? andyplot.higherIndex : andyplot.lowerIndex)(page.times, to, startIndex, page.times.length - 1))
          :
          page.times.length - 1;

        for (var i = startIndex; i <= endIndex; i++) {
          consumer(page.times[i], page.values[i]);
        }
      } else {
        // pass a NaN into the consumer to indicate that there is a gap in data
        consumer(pageStart, NaN);

        // create a placeholder page so that we don't request this data again
        page = pages[pageStart] = new CachePage(pageStart, pageEnd, [pageStart], [NaN]);
        page.placeholder = true;

        if(this.dataSource) {
          this.dataSource.query({
            beginTime: pageStart,
            endTime: pageEnd
          }).then(page => queryCallback(channelId, page));
        }
      }

      pageStart = pageEnd;
      pageEnd += this.pageRange;
    }
  }

  fetchLatestData() {
    var params = {};
    if (this.lastFetchedData && this.lastFetchedData.endTime) {
      params.beginTime = this.lastFetchedData.endTime;
    }
    if(this.dataSource) {
      this.dataSource.query(params, this.fetchLatestDataComplete.bind(this, params.beginTime));
    }
  }

  fetchLatestDataComplete(beginTime, rawData) {
    this.lastFetchedData = rawData;
    var channelId, channelData;

    if (this.lastFetchedData.realTimeData) {
      this.emit('realTimeDataReceived');
    }

    var historical = rawData.historicalData;
    if (!historical) {
      return;
    }

    if (isNaN(beginTime)) {

      // default to the earliest time among the data points in the response
      for (channelId in historical) {
        if (historical.hasOwnProperty(channelId)) {
          channelData = historical[channelId];
          if (channelData && channelData.t && channelData.t.length) {
            if (isNaN(beginTime)) {
              beginTime = channelData.t[0];
            } else {
              beginTime = Math.min(beginTime, channelData.t[0]);
            }
          }
        }
      }

      // no data points in the response?
      if (isNaN(beginTime)) {
        return;
      }
    }

    var dataWasAdded = false;

    for (channelId in historical) {
      if (historical.hasOwnProperty(channelId)) {
        channelData = historical[channelId];
        if (channelData && channelData.t && channelData.t.length && channelData.v) {
          var newPages = new CachePage(beginTime, rawData.endTime,
            channelData.t, channelData.v).chunk(this.pageRange);

          if (newPages.length > 0) {
            dataWasAdded = true;

            this.addOrMergePage(channelId, newPages[0]);

            for (var i = 1; i < newPages.length; i++) {
              this.addOrReplacePage(channelId, newPages[i]);
            }
          }
        }
      }
    }

    if (dataWasAdded) {
      this.emit('dataAdded', {channels: Object.keys(historical), beginTime, endTime: rawData.endTime});
    }

    if(this.metadataModCount !== rawData.metadataModCount) {
      this.emit('metadataChanged');
      this.metadataModCount = rawData.metadataModCount;
    }
  }

  turnOnRealTimeDataFetch(delay) {
    if (!this.intervalPromise) {
      this.intervalPromise = setInterval(this.fetchLatestData.bind(this), delay);
    }
  }

  turnOffRealTimeDataFetch() {
    if (this.intervalPromise) {
      clearInterval(this.intervalPromise);
      delete this.intervalPromise;
    }
  }

  getLastRealTimeData(channelId) {
    try {
      return {
        t: this.lastFetchedData.realTimeData[channelId].t,
        v: this.lastFetchedData.realTimeData[channelId].v
      };
    } catch(err) {
      return undefined;
    }
  }
}