import r from '../../../database/rethinkdriver'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import {errorObj} from '../utils'
import bcrypt from 'bcrypt'
import logger from '../../../logger'
import promisify from 'es6-promisify'

const compare = promisify(bcrypt.compare)

export const getUserByUsername = async username => {
  const users = await r.table('users').getAll(username, {index: 'username'}).limit(1).run()
  return users[0]
}

export const getUserByEmail = async email => {
  const users = await r.table('users').getAll(email, {index: 'email'}).limit(1).run()
  return users[0]
}

export const getUserByAuthToken = async authToken => {
  const {id} = authToken
  if (!id) {
    throw errorObj({_error: 'Invalid authentication token'})
  }

  const user = await r.table('users').get(id)
  if (!user) {
    throw errorObj({_error: 'User not found'})
  }
  return user
}

export const sendVerifyEmail = async verifiedEmailToken => {
  // TODO send email with verifiedEmailToken via mailgun or whatever
  logger.log('Verify url:', `${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}/portal/verify-email/${verifiedEmailToken}`)
}

export const sendResetPasswordEmail = async resetToken => {
  // TODO send email with verifiedEmailToken via mailgun or whatever
  logger.log('Reset url:', `${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}/portal/login/reset-password/${resetToken}`)
}

export const signJwt = ({id}) => {
  const secret = process.env.JWT_SECRET || 'topsecret'
  // sync https://github.com/auth0/node-jsonwebtoken/issues/111
  return jwt.sign({id}, secret, {expiresIn: '7d'})
}

/* if login fails with 1 strategy, suggest another*/
export const getAltLoginMessage = (userStrategies = {}) => {
  const authTypes = Object.keys(userStrategies)
  let authStr = authTypes.reduce((reduction, type) => `${reduction} ${type}, or `, 'Try logging in with ')
  authStr = authStr.slice(0, -5).replace('local', 'your password')
  return authTypes.length ? authStr : 'Create a new account'
}

export const checkPassword = async (user, password, fieldName = 'password') => {
  const {strategies} = user
  const hashedPassword = strategies && strategies.local && strategies.local.password
  if (!hashedPassword) {
    throw errorObj({_error: getAltLoginMessage(strategies)})
  }
  const isCorrectPass = await compare(password, hashedPassword)
  if (!isCorrectPass) {
    throw errorObj({_error: 'Incorrect password', [fieldName]: 'Incorrect password'})
  }
}

/* a secret token has the user id, an expiration, and a secret
 the expiration allows for invalidating on the client or server. No need to hit the DB with an expired token
 the user id allows for a quick db lookup in case you don't want to index on email (also eliminates pii)
 the secret keeps out attackers (proxy for rate limiting, IP blocking, still encouraged)
 storing it in the DB means there exists only 1, one-time use key, unlike a JWT, which has many, multi-use keys*/
export const makeSecretToken = (userId, minutesToExpire) => {
  return new Buffer(JSON.stringify({
    id: userId,
    sec: crypto.randomBytes(8).toString('base64'),
    exp: Date.now() + 1000 * 60 * minutesToExpire
  })).toString('base64')
}
