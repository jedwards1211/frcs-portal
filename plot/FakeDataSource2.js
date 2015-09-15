import Promise from 'bluebird';
import 'seedrandom';

import CachePage from './CachePage';
import * as GridMath from './GridMath';

class NoiseGen {
  constructor(seed, period, amplitude) {
    this.seed = seed;
    this.freq = 1 / period;
    this.amplitude = amplitude;
    this.cache = [];
  }

  cachedValue(time) {
    if (!this.cache[time]) {
      Math.seedrandom(time + this.seed);
      this.cache[time] = Math.random();
    }
    return this.cache[time];
  }

  valueAt(time) {
    var m = time * this.freq;
    var m0 = Math.floor(m);
    var m1 = m0 + 1;
    var f = m - m0;
    m0 = this.cachedValue(m0);
    m1 = this.cachedValue(m1);
    return ((1 - f) * m0 + f * m1 - 0.5) * this.amplitude;
  }
}

export default class FakeDataSource {
  constructor(options = {}) {
    this.increment            = options.increment           || 10000;
    this.majorPeriod          = options.majorPeriod         || 3600000;
    this.majorAmplitude       = options.majorAmplitude      || 5;
    this.variancePeriod       = options.variancePeriod      || 4782052;
    this.varianceAmplitude    = options.varianceAmplitude   || 2;
    this.delay                = options.delay               || 1000;

    this.majorGens = {};
    this.varianceGens = {};
  }

  valueAt(channelId, time) {
    var majorGen = this.majorGens[channelId];
    if (!majorGen) {
      majorGen = this.majorGens[channelId] = new NoiseGen(channelId, this.majorPeriod, this.majorAmplitude);
    }
    var varianceGen = this.varianceGens[channelId];
    if (!varianceGen) {
      varianceGen = this.varianceGens[channelId] = new NoiseGen(channelId, this.variancePeriod, this.varianceAmplitude);
    }
    var m = majorGen.valueAt(time);
    var v = varianceGen.valueAt(time) + this.varianceAmplitude;
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
        Math.seedrandom(new Date().toISOString());
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
