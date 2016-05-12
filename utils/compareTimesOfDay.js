/* @flow */

function resetDate(date: Date): Date {
  let d = new Date(date)
  d.setFullYear(1970)
  d.setMonth(0)
  d.setDate(1)
  return d
}

export default function compareTimesOfDay(date1: Date, date2: Date): number {
  return resetDate(date1).getTime() - resetDate(date2).getTime()
}
