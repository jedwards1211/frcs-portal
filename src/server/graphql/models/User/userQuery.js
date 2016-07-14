import r from '../../../database/rethinkdriver'
import {GraphQLNonNull, GraphQLString, GraphQLID} from 'graphql'
import {User, UserWithAuthToken} from './userSchema'
import {errorObj} from '../utils'
import {GraphQLUsernameType, GraphQLEmailType, GraphQLPasswordType} from '../types'
import {getUserByUsername, getUserByEmail, signJwt, getAltLoginMessage, getUserGroupnames} from './helpers'
import promisify from 'es6-promisify'
import bcrypt from 'bcrypt'
import {isAdminOrSelf} from '../authorization'

const compare = promisify(bcrypt.compare)

export default {
  getUserById: {
    type: User,
    args: {
      id: {type: new GraphQLNonNull(GraphQLID)}
    },
    async resolve(source, args, {authToken}) {
      isAdminOrSelf(authToken, args)
      const user = await r.table('users').get(args.id)
      if (!user) {
        throw errorObj({_error: 'User not found'})
      }
      user.groupnames = await getUserGroupnames(args.id)
      return user
    }
  },
  login: {
    type: UserWithAuthToken,
    args: {
      username: {type: GraphQLUsernameType},
      email: {type: GraphQLEmailType},
      password: {type: new GraphQLNonNull(GraphQLPasswordType)}
    },
    async resolve(source, args) {
      const {username, email, password} = args
      const user = (username && await getUserByUsername(username)) ||
        (email && await getUserByEmail(email))
      if (!user) {
        throw errorObj({_error: 'Login failed', email: 'User not found'})
      }
      const {strategies} = user
      const hashedPassword = strategies && strategies.local && strategies.local.password
      if (!hashedPassword) {
        throw errorObj({_error: getAltLoginMessage(strategies)})
      }
      const isCorrectPass = await compare(password, hashedPassword)
      if (isCorrectPass) {
        user.groupnames = await getUserGroupnames(user.id)
        const authToken = signJwt({id: user.id})
        return {authToken, user}
      }
      throw errorObj({_error: 'Login failed', password: 'Incorrect password'})
    }
  },
  loginAuthToken: {
    type: User,
    async resolve(source, args, {authToken}) {
      const {id} = authToken
      if (!id) {
        throw errorObj({_error: 'Invalid authentication Token'})
      }
      const user = await r.table('users').get(id)
      if (!user) {
        throw errorObj({_error: 'User not found'})
      }
      user.groupnames = getUserGroupnames(id)
      return user
    }
  }
}

