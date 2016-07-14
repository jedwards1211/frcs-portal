import {GraphQLObjectType, GraphQLNonNull, GraphQLID} from 'graphql'
import {GraphQLGroupnameType} from '../types'

export const Group = new GraphQLObjectType({
  name: 'Group',
  description: 'A user group',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The groupId'},
    groupname: {type: new GraphQLNonNull(GraphQLGroupnameType), description: 'The group name'},
  })
})
