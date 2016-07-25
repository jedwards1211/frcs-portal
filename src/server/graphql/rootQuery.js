import {GraphQLObjectType} from 'graphql'
import user from './models/User/userQuery'
import settings from './models/Settings/settingsQuery'

const rootFields = Object.assign(user, settings)

export default new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => rootFields
})
