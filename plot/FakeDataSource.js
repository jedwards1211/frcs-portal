import Promise from 'bluebird';

import Page from './Page';
import * as andyplot from './andyplot';

export default class FakeDataSource {
  constructor(options = {}) {
    this.increment            = options.increment           || 1000;
    this.startTime            = options.startTime           || 0;
    this.endTime              = options.endTime             || 3600000 * 72;
    this.majorAmplitude       = options.majorAmplitude      || 1;
    this.majorDamping         = options.majorDamping        || 0.9;
    this.varianceAmplitude    = options.varianceAmplitude   || 1;
    this.varianceDamping      = options.varianceDamping     || 0.9;
    this.minorDamping         = options.minorDamping        || 0.95;
    this.delay                = options.delay               || 1000;

    var times = this.times = [];
    var values = this.values = [];

    var major = 0;
    var variance = 1;
    var minor = 0;

    for (var time = this.startTime; time < this.endTime; time += this.increment) {
      major = (major + (Math.random() - 0.5) * this.majorAmplitude) * this.majorDamping;
      variance = (variance + (Math.random() - 0.5) * this.varianceAmplitude) * this.varianceDamping;
      minor = (minor + (Math.random() - 0.5) * variance) * this.minorDamping;

      times.push(time);
      values.push(major + minor);
    }
  }

  get(from, to, surround, callback) {
    var {times, values} = this;

    var beginIndex, endIndex;
    if (surround) {
      beginIndex = andyplot.lowerIndex(times, from);
      endIndex = andyplot.higherIndex(times, to);
    }
    else {
      beginIndex = andyplot.ceilingIndex(times, from);
      endIndex = andyplot.floorIndex(times, to);
    }

    for (var i = beginIndex; i <= endIndex; i++) {
      callback(times[i], values[i]);
    }
  }

  query(options) {
    return new Promise((resolve, reject) => {
      var {beginTime, endTime} = options;

      var startIndex = andyplot.ceilingIndex(this.times, beginTime);
      var endIndex = andyplot.ceilingIndex(this.times, endTime);

      var times = this.times.slice(startIndex, endIndex);
      var values = this.values.slice(startIndex, endIndex);

      resolve(new Page(beginTime, endTime, times, values));
    }).delay(1000);
  }
}