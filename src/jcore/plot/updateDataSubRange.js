/**
 * Decides the new data subscription range based upon a current subscription range, a new
 * view range, and minimum and maximum range.
 *
 * currentRange: {beginTime: number, endTime: number} (endTime must be > beginTime)
 * newViewRange: {beginTime: number, endTime: number} (endTime must be > beginTime)
 * options: {minRange: number, maxRange: number} (maxRange must be > minRange)
 */
export default function updateDataSubRange(currentRange, newViewRange, options) {
  let {minRange, maxRange} = options
  let {beginTime, endTime} = newViewRange

  if (currentRange && currentRange.beginTime >= currentRange.endTime) {
    throw new Error('currentRange is malformed')
  }
  if (newViewRange.beginTime >= newViewRange.endTime) {
    throw new Error('newViewRange is malformed')
  }

  if (minRange > maxRange) {
    throw new Error('minRange must be <= maxRange')
  }
  if (endTime - beginTime > maxRange) {
    throw new Error('newViewRange is bigger than maxRange')
  }

  let center = (beginTime + endTime) * 0.5

  // union with currentRange
  if (currentRange && !isNaN(currentRange.beginTime) && !isNaN(currentRange.endTime)) {
    beginTime = Math.min(beginTime, currentRange.beginTime)
    endTime   = Math.max(endTime, currentRange.endTime  )
  }

  // shrink range if it is bigger than maxRange
  if (endTime - beginTime > maxRange) {
    if (endTime - newViewRange.endTime <= newViewRange.beginTime - beginTime) {
      // newViewRange is closer to end of combined range
      beginTime = endTime - maxRange
    }
    else {
      // newViewRange is closer to beginning of combined range
      endTime = beginTime + maxRange
    }
  }

  // expand to at least minRange or newViewRange
  beginTime = Math.min(beginTime, newViewRange.beginTime, center - minRange / 2)
  endTime   = Math.max(endTime, newViewRange.endTime,   center + maxRange / 2)

  return {beginTime, endTime}
}
