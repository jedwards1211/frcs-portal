import dummyCanvas from './dummyCanvas';
import measureTextPolyfill from './measureTextPolyfill';

/**
 * Caches TextMetrics for various fonts.  Should only be used for the vertical metrics, not the
 * horizontal metrics.
 */
class FontMetricsCache {
  cache = new Map();
  getFontMetrics(font) {
    let metrics = this.cache.get(font);
    if (!metrics) {
      let ctx = dummyCanvas.getContext('2d');
      ctx.font = font;
      metrics = measureTextPolyfill(ctx, 'ÁThegqjlf');
      this.cache.set(font, metrics);
    }
    return metrics;
  }
}

export default new FontMetricsCache();
