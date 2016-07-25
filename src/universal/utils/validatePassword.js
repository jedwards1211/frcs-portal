import testPassword from './testPassword'

const MAX_LEN = 80

export default function validatePassword(password) {
  const result = testPassword(password)
  if (result.requiredTestErrors && result.requiredTestErrors.length) {
    return {valid: false, error: result.requiredTestErrors[0]}
  }
  if (!result.strong) {
    return {valid: false, error: `Password isn't strong enough`}
  }
  if (password.length > MAX_LEN) {
    return {valid: false, error: `Password length must be <= ${MAX_LEN}`}
  }
  return {valid: true}
}