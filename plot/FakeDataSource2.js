import Promise from 'bluebird';
import 'seedrandom';

import Page from './Page';
import * as andyplot from './andyplot';

function stretchRandom(time, period, amplitude) {
    var m = time / period;
    var m0 = Math.floor(m);
    var m1 = m0 + 1;
    var f = m - m0;
    Math.seedrandom(m0); m0 = Math.random();
    Math.seedrandom(m1); m1 = Math.random();
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

  valueAt(time) {
    var m = stretchRandom(time, this.majorPeriod, this.majorAmplitude);
    var v = stretchRandom(time, this.variancePeriod, this.varianceAmplitude) + this.varianceAmplitude;
    Math.seedrandom(time);
    return m + v * (Math.random() - 0.5);
  }

  get(from, to, surround, callback) {
    for (var time = andyplot.modLower(from, this.increment); time < to + this.increment; time += this.increment) {
      callback(time, this.valueAt(time));
    }
  }

  query(options) {
    return new Promise((resolve, reject) => {
      var {beginTime, endTime} = options;
      var times = [];
      var values = [];

      var {increment} = this;

      var time = andyplot.modCeiling(beginTime, increment);

      var makeValues = () => {
        var i = 0;
        while (time < endTime && i++ < 500) {
          times.push(time);
          values.push(this.valueAt(time));
          time += increment;
        }
        if (time < endTime) {
          setTimeout(makeValues, 0);
        }
        else {
          resolve(new Page(beginTime, endTime, times, values));
        }
      };

      setTimeout(makeValues, 0);

      // for (var time = andyplot.modCeiling(beginTime, increment); time < endTime; time += increment) {
      //   times.push(time);
      //   values.push(this.valueAt(time));
      // }

      // resolve(new Page(beginTime, endTime, times, values));
    }).delay(1000);
  }
}