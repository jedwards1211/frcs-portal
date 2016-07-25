export default function required(value) {
  if (value == null || value === '') return {valid: false, error: 'Required'}
  return {valid: true}
}
