/* @flow */

import _ from 'lodash'

export default function parseElapsedTime(value: string): number {
  let match = /^(\d+):(\d{2})(:(\d{2})(\.(\d{1,3}))?)?$/.exec(value)

  if (!match) return NaN

  let hours = parseInt(match[1] || '0')
  let minutes = parseInt(match[2] || '0')
  let seconds = parseInt(match[4] || '0')
  let millis = parseInt(_.padEnd(match[6] || '000', 3, '0'))

  if (minutes > 59 || seconds > 59) return NaN

  return hours * 3600000 + minutes * 60000 + seconds * 1000 + millis
}
