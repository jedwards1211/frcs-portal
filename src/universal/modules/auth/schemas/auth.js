import Joi from 'joi'

const anyErrors = {
  required: '!!Required',
  empty: '!!Required'
}

export const signupAuthSchema = Joi.object().keys({
  username: Joi.string().trim().lowercase().min(4).max(20).label('Username').required().options({
    language: {
      any: anyErrors,
      string: {
        min: '{{!key}} must be at least {{limit}} chars long',
        max: '{{!key}} must be less than {{limit}} chars long'
      }
    }
  }),
  email: Joi.string().email().trim().lowercase().max(200).label('Email').required().options({
    language: {
      any: anyErrors,
      string: {
        email: '!!That\'s not an email!'
      }
    }
  }),
  password: Joi.string().min(8).label('Password').required().options({
    language: {
      any: anyErrors,
      string: {
        min: '{{!key}} must be at least {{limit}} chars long'
      }
    }
  })
})
export const loginAuthSchema = Joi.object().keys({
  email: Joi.string().trim().lowercase().max(200).label('Username or Email').required().options({
    language: {
      any: anyErrors,
      string: {
        email: 'Invalid username or email'
      }
    }
  }),
  password: Joi.string().min(8).label('Password').required().options({
    language: {
      any: anyErrors,
      string: {
        min: '{{!key}} must be at least {{limit}} chars long'
      }
    }
  })
})

export const authSchemaEmail = signupAuthSchema.optionalKeys('username', 'password')
export const authSchemaPassword = signupAuthSchema.optionalKeys('username', 'email')
