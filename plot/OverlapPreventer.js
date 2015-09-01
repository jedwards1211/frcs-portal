import {floorIndex, ceilingIndex} from './precisebs';

/**
 * Stores one-dimensional regions and allows you to insert new regions only if they don't
 * overlap existing ones.  This is used by GridAxis to avoid drawing overlapping labels.
 */
export default class OverlapPreventer {
  constructor() {
    this.mins = [];
    this.maxes = [];
  }

  /**
   * Attempts to insert the region [min, max].  If it's within minSpacing units of any previously
   * inserted region, it won't be inserted.
   * @param {number} min - the start of the region
   * @param {number} max - the end of the region
   * @param {number} minSpacing - the minimum spacing between regions
   * @returns {boolean} true iff the region was inserted.
   */
  insert(min, max, minSpacing = 0) {
    if (min > max) {
      var swap = min;
      min = max;
      max = swap;
    } 

    if (!this.mins.length && !this.maxes.length) {
      this.mins[0] = min;
      this.maxes[0] = max;
      return true;
    }

    var loIndex = floorIndex  (this.mins , max - minSpacing);
    var hiIndex = ceilingIndex(this.maxes, min + minSpacing);

    if (loIndex >= 0 && this.maxes[loIndex] + minSpacing >= min) {
      return false;
    }
    if (hiIndex < this.maxes.length && this.mins [hiIndex] - minSpacing <= max) {
      return false;
    }

    this.mins .splice(hiIndex, 0, min);
    this.maxes.splice(hiIndex, 0, max);
    return true;
  }
}
