import Joi from 'joi'

const anyErrors = {
  required: '!!Required',
  empty: '!!Required'
}

const username = Joi.string().alphanum().trim().lowercase().min(4).max(20).label('Username').required().options({
  language: {
    any: anyErrors,
    string: {
      min: '{{!key}} must be at least {{limit}} chars long',
      max: '{{!key}} must be at most {{limit}} chars long'
    }
  }
})
const email = Joi.string().email().trim().lowercase().max(200).label('Email').required().options({
  language: {
    any: anyErrors,
    string: {
      email: '!!That\'s not an email!'
    }
  }
})

const password = Joi.string().min(8).max(200).label('Password').required().options({
  language: {
    any: anyErrors,
    string: {
      min: '{{!key}} must be at least {{limit}} chars long',
      max: '{{!key}} must be at most {{limit}} chars long'
    }
  }
})

const confirmPassword = Joi.string().valid(Joi.ref('password')).required().options({
  language: {
    any: {
      ...anyErrors, 
      allowOnly: '!!Passwords do not match'
    }
  } 
})

export const signupAuthSchema = Joi.object().keys({
  username,
  email,
  password,
  confirmPassword
})
export const loginAuthSchema = Joi.object().keys({
  email: Joi.string().alphanum().trim().lowercase().min(4).max(200).label('Username or Email').required().options({
    language: {
      any: anyErrors,
      string: {
        min: '{{!key}} must be at least {{limit}} chars long',
        max: '{{!key}} must be at most {{limit}} chars long'
      }
    }
  }),
  password
})

export const emailAuthSchema = Joi.object().keys({
  email 
})

export const passwordAuthSchema = Joi.object().keys({
  password,
  confirmPassword
})
