import Promise from 'bluebird';
import 'seedrandom';

import CachePage from './CachePage';
import * as GridMath from './GridMath';

function stretchRandom(seed, time, period, amplitude) {
    var m = time / period;
    var m0 = Math.floor(m);
    var m1 = m0 + 1;
    var f = m - m0;
    Math.seedrandom(m0 + seed); m0 = Math.random();
    Math.seedrandom(m1 + seed); m1 = Math.random();
    return ((1 - f) * m0 + f * m1 - 0.5) * amplitude;
}

export default class FakeDataSource {
  constructor(options = {}) {
    this.increment            = options.increment           || 10000;
    this.majorPeriod          = options.majorPeriod         || 3600000;
    this.majorAmplitude       = options.majorAmplitude      || 5;
    this.variancePeriod       = options.variancePeriod      || 4782052;
    this.varianceAmplitude    = options.varianceAmplitude   || 2;
    this.delay                = options.delay               || 1000;
  }

  valueAt(channelId, time) {
    var m = stretchRandom(channelId, time, this.majorPeriod, this.majorAmplitude);
    var v = stretchRandom(channelId, time, this.variancePeriod, this.varianceAmplitude) + this.varianceAmplitude;
    Math.seedrandom(time + channelId);
    return m + v * (Math.random() - 0.5);
  }

  get(channelId, from, to, surround, callback) {
    for (var time = GridMath.modLower(from, this.increment); time < to + this.increment; time += this.increment) {
      callback(time, this.valueAt(channelId, time));
    }
  }

  query(options) {
    var {channelId, beginTime, endTime} = options;

    var canceled;
    return new Promise((resolve, reject) => {
      var times = [];
      var values = [];

      var {increment} = this;

      var time = GridMath.modCeiling(beginTime, increment);

      var makeValues = () => {
        if (canceled) {
          return;
        }
        var i = 0;
        while (time < endTime && i++ < 500) {
          times.push(time);
          values.push(this.valueAt(channelId, time));
          time += increment;
        }
        if (time < endTime) {
          setTimeout(makeValues, 0);
        }
        else {
          resolve(new CachePage(channelId, beginTime, endTime, times, values));
        }
      };

      setTimeout(makeValues, 0);

    }).delay(500).cancellable().catch(Promise.CancellationError, e => {
      canceled = true; 
    });
  }
}
