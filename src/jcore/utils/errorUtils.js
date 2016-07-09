export function errorMessage(err) {
  if (err === null || err === undefined) {
    return 'an unknown error has occurred'
  }
  if (err.message) {
    return err.message
  }
  if (err.toString) {
    return err.toString()
  }
  return JSON.stringify(err)
}
