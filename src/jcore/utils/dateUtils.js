const ONE_MINUTE = 60000
const ONE_HOUR = 3600000
const ONE_DAY = 24 * ONE_HOUR

export function startOfDate(date) {
  date = new Date(date.getTime())
  date.setHours(0)
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)
  return date
}

export function relativeTimeString(dateOrTime, options = {}) {
  let anchorTime = options.anchorTime || Date.now()
  if (anchorTime instanceof Date) anchorTime = anchorTime.getTime()

  let time = dateOrTime instanceof Date ? dateOrTime.getTime() : dateOrTime
  let date = new Date(time)

  let anchorDate = new Date(anchorTime)

  let timeSince = anchorTime - time

  if (timeSince >= ONE_DAY) {
    if (date.getYear() === anchorDate.getYear() && date.getMonth() === anchorDate.getMonth()) {
      let sevenDaysAgo = startOfDate(anchorDate)
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      if (date.getTime() >= sevenDaysAgo.getTime()) {
        let yesterday = startOfDate(anchorDate)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.getTime() >= yesterday.getTime()) {
          return 'yesterday'
        }
        else {
          switch (date.getDay()) {
            case 0: return 'last Sunday'
            case 1: return 'last Monday'
            case 2: return 'last Tuesday'
            case 3: return 'last Wednesday'
            case 4: return 'last Thursday'
            case 5: return 'last Friday'
            case 6: return 'last Saturday'
            default: // uhhhhh....
          }
        }
      }
    }
    return date.toDateString()
  }
  else if (timeSince > ONE_HOUR) {
    let hours = Math.floor(timeSince / ONE_HOUR)
    return hours === 1 ? 'one hour ago' : hours + ' hours ago'
  }
  else if (timeSince > ONE_MINUTE) {
    let minutes = Math.floor(timeSince / ONE_MINUTE)
    return minutes === 1 ? 'one minute ago' : minutes + ' minutes ago'
  }
  else {
    let seconds = Math.floor(timeSince / 1000)
    return seconds === 0 ? 'just now' : seconds === 1 ? 'one second ago' : seconds + ' seconds ago'
  }
}
