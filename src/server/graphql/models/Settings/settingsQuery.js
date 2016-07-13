import r from '../../../database/rethinkdriver'
import {Settings} from './settingsSchema'
import {isLoggedIn} from '../authorization'
import membersConfig from '../../../members/config'

export default {
  getSettings: {
    type: Settings,
    resolve: async function resolve(source, args, {authToken}) {
      isLoggedIn(authToken)
      const user = await r.table('users').get(authToken.id).run()
      if (user && user.strategies && user.strategies.local && user.strategies.local.isVerified) {
        return membersConfig
      }
      throw errorObj({_error: 'You must verify your e-mail address to access these settings'})
    }
  }
}
