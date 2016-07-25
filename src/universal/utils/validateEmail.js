const MIN_LEN = 4
const MAX_LEN = 300

export default function validateEmail(email) {
  if (!/^.+@.+$/.test(email)) {
    return {valid: false, error: 'Not a valid email'}
  }
  if (email.length < MIN_LEN) {
    return {valid: false, error: `Email length must be >= ${MIN_LEN}`}
  }
  if (email.length > MAX_LEN) {
    return {valid: false, error: `Email length must be <= ${MAX_LEN}`}
  }
  return {valid: true}
}
