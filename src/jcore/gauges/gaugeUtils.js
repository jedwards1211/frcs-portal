import {floorValue} from '../plot/precisebs'

export const GAUGE_FONT_SIZES = [8, 10, 12, 14, 16, 18, 21, 24, 30, 36, 42, 48, 60, 72, 80, 88, 96]

export function pickFontSize(maxFontSize) {
  return floorValue(GAUGE_FONT_SIZES, maxFontSize) || GAUGE_FONT_SIZES[0]
}
