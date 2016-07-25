const MIN_LEN = 4
const MAX_LEN = 20

export default function validateUsername(username) {
  if (!/^[a-z0-9]+$/.test(username)) {
    return {valid: false, error: 'Username can only contain lowercase letters and numbers'}
  }
  if (username.length < MIN_LEN) {
    return {valid: false, error: `Username length must be >= ${MIN_LEN}`}
  }
  if (username.length > MAX_LEN) {
    return {valid: false, error: `Username length must be <= ${MAX_LEN}`}
  }
  return {valid: true}
}
