export default function validateFields(validators) {
  return function validate(values) {
    const result = {}
    for (let field in validators) {
      if (values[field]) {
        const validation = validators[field](values[field])
        if (validation.error) result[field] = validation.error
        else if (validation.warning) result[field] = validation.warning
      }
    }
    return result
  }
}
