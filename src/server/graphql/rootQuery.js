import {GraphQLObjectType} from 'graphql'
import user from './models/User/userQuery'
import lane from './models/Lanes/laneQuery'
import note from './models/Notes/noteQuery'
import settings from './models/Settings/settingsQuery'

const rootFields = Object.assign(user, lane, note, settings)

export default new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => rootFields
})
