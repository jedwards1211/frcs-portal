import r from '../../../database/rethinkdriver'
import {User, UserWithAuthToken} from './userSchema'
import {getUserByUsername, getUserByEmail, getUserByAuthToken, checkPassword, sendVerifyEmail, sendResetPasswordEmail,
  signJwt, makeSecretToken, getUserGroupnames} from './helpers'
import {errorObj} from '../utils'
import {GraphQLNonNull, GraphQLBoolean, GraphQLString} from 'graphql'
import validateSecretToken from '../../../../universal/utils/validateSecretToken'
import validateUsername from '../../../../universal/utils/validateUsername'
import validateEmail from '../../../../universal/utils/validateEmail'
import validatePassword from '../../../../universal/utils/validatePassword'
import {isLoggedIn} from '../authorization'
import promisify from 'es6-promisify'
import bcrypt from 'bcrypt'
import uuid from 'node-uuid'
import settings from '../../../settings'

import getMemberInfo from '../../../members/getMemberInfo'

const hash = promisify(bcrypt.hash)

const initUserGroups = settings.initUserGroups || {}

export default {
  createUser: {
    type: UserWithAuthToken,
    args: {
      username: {type: new GraphQLNonNull(GraphQLString)},
      email: {type: new GraphQLNonNull(GraphQLString)},
      password: {type: new GraphQLNonNull(GraphQLString)}
    },
    async resolve(source, {username, email, password}) {
      const validation = {
        username: validateUsername(username),
        email: validateEmail(email),
        password: validatePassword(password)
      }
      if (!validation.username.valid || !validation.email.valid || !validation.password.valid) {
        const error = {_error: 'Cannot create account'}
        if (validation.username.error) error.username = validation.username.error
        if (validation.email.error) error.email = validation.email.error
        if (validation.password.error) error.password = validation.password.error
        throw errorObj(error)
      }

      const userByUsername = await getUserByUsername(username)
      const userByEmail = await getUserByEmail(email)
      const user = userByUsername || userByEmail
      if (user) {
        try {
          await checkPassword(user, password)
          const authToken = signJwt({id: user.id})
          return {authToken, user}
        } catch (err) {
          const error = {_error: 'Cannot create account'}
          if (userByUsername) error.username = 'Username already taken'
          if (userByEmail) error.email = 'Email already registered'
          throw errorObj(error)
        }
      } else {
        let memberInfo = {}
        if (!process.env.OFFLINE_MODE) {
          try {
            memberInfo = await getMemberInfo({email})
          } catch (err) {
            throw new errorObj({_error: err.message})
          }
        }

        const {firstName, lastName} = memberInfo

        // production should use 12+, but it's slow for dev
        const newHashedPassword = await hash(password, 10)
        const id = uuid.v4()
        // must verify email within 1 day
        const verifiedEmailToken = makeSecretToken(id, 60 * 24)
        const newUser = await r.table('users').insert({
          id,
          username,
          email,
          groupnames: [],
          firstName,
          lastName,
          createdAt: new Date(),
          strategies: {
            local: {
              isVerified: false,
              password: newHashedPassword,
              verifiedEmailToken
            }
          },
          uidnumber: r.branch(
            r.table('users').filter(u => u('uidnumber')).isEmpty(),
            process.env.MIN_UID_NUMBER,
            r.table('users').max(u => u('uidnumber'))('uidnumber').add(1)
          )
        })
        if (!newUser.inserted) {
          throw errorObj({_error: 'Could not create account, please try again'})
        }
        const userDoc = await r.table('users').get(id)
        const requestGroupNames = (initUserGroups.dugMembers || [])
          .concat(initUserGroups.byEmail && initUserGroups.byEmail[email] || [])

        const groupIds = await r.table('groups').getAll(...requestGroupNames, {index: 'groupname'})
          .map(g => g('id')).coerceTo('array').run()
        if (groupIds.length) {
          const results = await r.table('users_groups').insert(groupIds.map(group_id => ({user_id: id, group_id}))).run()
          if (results.inserted !== groupIds.length) {
            throw errorObj({_error: 'Failed to add you to some groups'})
          }
        }
        await sendVerifyEmail(email, verifiedEmailToken)
        const authToken = signJwt({id})
        return {user: userDoc, authToken}
      }
    }
  },
  emailPasswordReset: {
    type: GraphQLBoolean,
    args: {
      email: {type: new GraphQLNonNull(GraphQLString)}
    },
    async resolve(source, {email}) {
      const user = await getUserByEmail(email)
      if (!user) {
        throw errorObj({_error: 'User not found'})
      }
      const resetToken = makeSecretToken(user.id, 60 * 24)
      const result = await r.table('users').get(user.id).update({strategies: {local: {resetToken}}})
      if (!result.replaced) {
        throw errorObj({_error: 'Could not find or update user'})
      }
      await sendResetPasswordEmail(email, resetToken)
      return true
    }
  },
  resetPassword: {
    type: UserWithAuthToken,
    args: {
      password: {type: new GraphQLNonNull(GraphQLString)}
    },
    async resolve(source, {password}, context) {
      const validation = validatePassword(password)
      if (!validation.valid) {
        throw errorObj({
          _error: 'Failed to change password',
          password: validation.error
        })
      }
      const {resetToken} = context
      const resetTokenObject = validateSecretToken(resetToken)
      if (resetTokenObject._error) {
        throw errorObj(resetTokenObject)
      }
      const user = await r.table('users').get(resetTokenObject.id)
      if (!user) {
        throw errorObj({_error: 'User not found'})
      }
      const userResetToken = user.strategies && user.strategies.local && user.strategies.local.resetToken
      if (!userResetToken || userResetToken !== resetToken) {
        throw errorObj({_error: 'Unauthorized'})
      }
      const newHashedPassword = await hash(password, 10)
      const updates = {
        strategies: {
          local: {
            password: newHashedPassword,
            resetToken: null
          }
        }
      }
      const result = await r.table('users').get(user.id).update(updates, {returnChanges: true})
      if (!result.replaced) {
        throw errorObj({_error: 'Could not find or update user'})
      }
      const newUser = result.changes[0].new_val
      newUser.groupnames = await getUserGroupnames(user.id)
      const newAuthToken = signJwt(newUser)
      return {newAuthToken, user: newUser}
    }
  },
  changePassword: {
    type: GraphQLBoolean,
    args: {
      oldPassword: {type: new GraphQLNonNull(GraphQLString)},
      newPassword: {type: new GraphQLNonNull(GraphQLString)}
    },
    async resolve(source, {oldPassword, newPassword}, {authToken}) {
      isLoggedIn(authToken)
      const user = await getUserByAuthToken(authToken)

      await checkPassword(user, oldPassword, 'oldPassword')
      const validation = validatePassword(newPassword)
      if (!validation.valid) {
        throw errorObj({
          _error: 'Failed to change password',
          newPassword: validation.error
        })
      }

      const newHashedPassword = await hash(newPassword, 10)
      const updates = {
        strategies: {
          local: {
            password: newHashedPassword,
            resetToken: null
          }
        }
      }
      const result = await r.table('users').get(user.id).update(updates, {returnChanges: true})
      if (!result.replaced) {
        throw errorObj({_error: 'Failed to update user'})
      }
      return true
    }
  },
  resendVerificationEmail: {
    type: GraphQLBoolean,
    async resolve(source, args, {authToken}) {
      isLoggedIn(authToken)
      const user = await getUserByAuthToken(authToken)
      const {id} = user

      if (user.strategies && user.strategies.local && user.strategies.local.isVerified) {
        throw errorObj({_error: 'Email already verified'})
      }
      const verifiedEmailToken = makeSecretToken(id, 60 * 24)
      const result = await r.table('users').get(id).update({strategies: {local: {verifiedEmailToken}}})
      if (!result.replaced) {
        throw errorObj({_error: 'Could not find or update user'})
      }
      await sendVerifyEmail(user.email, verifiedEmailToken)
      return true
    }
  },
  verifyEmail: {
    type: UserWithAuthToken,
    async resolve(source, args, {verifiedEmailToken}) {
      const verifiedEmailTokenObj = validateSecretToken(verifiedEmailToken)
      if (verifiedEmailTokenObj._error) {
        throw errorObj(verifiedEmailTokenObj)
      }
      const {id} = verifiedEmailTokenObj
      const user = await r.table('users').get(id)
      if (!user) {
        throw errorObj({_error: 'User not found'})
      }
      const localStrategy = user.strategies && user.strategies.local || {}
      if (localStrategy && localStrategy.isVerified) {
        throw errorObj({_error: 'Email already verified'})
      }
      if (localStrategy && localStrategy.verifiedEmailToken !== verifiedEmailToken) {
        throw errorObj({_error: 'Unauthorized'})
      }
      const updates = {
        strategies: {
          local: {
            isVerified: true,
            verifiedEmailToken: null
          }
        }
      }
      const result = await r.table('users').get(id).update(updates, {returnChanges: true})
      if (!result.replaced) {
        throw errorObj({_error: 'Could not find or update user'})
      }
      const newUser = result.changes[0].new_val
      newUser.groupnames = await getUserGroupnames(id)
      return {
        user: newUser,
        authToken: signJwt(verifiedEmailTokenObj)
      }
    }
  },
  changeEmail: {
    type: User,
    args: {
      password: {type: new GraphQLNonNull(GraphQLString)},
      newEmail: {type: new GraphQLNonNull(GraphQLString)}
    },
    async resolve(source, {password, newEmail}, {authToken}) {
      const validation = validateEmail(newEmail)
      if (!validation.valid) {
        throw errorObj({
          _error: 'Failed to change email address',
          newEmail: validation.error
        })
      }

      isLoggedIn(authToken)
      const user = await getUserByAuthToken(authToken)

      await checkPassword(user, password)

      if (user.email === newEmail) {
        throw errorObj({_error: 'This is your current email address; nothing changed'})
      }

      const userByEmail = await getUserByEmail(newEmail)
      if (userByEmail && userByEmail.id !== user.id) {
        throw errorObj({_error: 'Could not change email address', newEmail: 'Email belongs to another user'})
      }

      // must verify email within 1 day
      const verifiedEmailToken = makeSecretToken(user.id, 60 * 24)
      const updates = {
        email: newEmail,
        strategies: {
          local: {
            isVerified: false,
            verifiedEmailToken
          }
        }
      }
      const result = await r.table('users').get(user.id).update(updates)
      if (!result.replaced) {
        throw errorObj({_error: 'Could not change email address, please try again'})
      }
      await sendVerifyEmail(newEmail, verifiedEmailToken)

      const newUser = await r.table('users').get(user.id).run()
      newUser.groupnames = await getUserGroupnames(user.id)
      return newUser
    }
  }
}
