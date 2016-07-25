import {GraphQLObjectType, GraphQLNonNull, GraphQLID, GraphQLString} from 'graphql'

export const Group = new GraphQLObjectType({
  name: 'Group',
  description: 'A user group',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The groupId'},
    groupname: {type: new GraphQLNonNull(GraphQLString), description: 'The group name'},
  })
})
