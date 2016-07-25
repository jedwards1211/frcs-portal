export default function validateFields(validators) {
  return function validate(values) {
    const result = {}
    for (let field in validators) {
      const validatorArray = Array.isArray(validators[field]) ? validators[field] : [validators[field]]
      for (let validator of validatorArray) {
        const validation = validator(values[field], values)
        if (validation.error) result[field] = validation.error
        else if (validation.warning) result[field] = validation.warning
        if (!validation.valid) break
      }
    }
    return result
  }
}
