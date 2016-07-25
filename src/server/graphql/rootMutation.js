import {GraphQLObjectType} from 'graphql'
import user from './models/User/userMutation'

const rootFields = Object.assign(user)

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: () => rootFields
})
