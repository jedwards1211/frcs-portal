import {GraphQLObjectType, GraphQLNonNull, GraphQLID, GraphQLInt, GraphQLString} from 'graphql'

export const Group = new GraphQLObjectType({
  name: 'Group',
  description: 'A user group',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLInt), description: 'The groupId'},
    gidnumber: {type: new GraphQLNonNull(GraphQLString), description: 'posix gidnumber'},
    groupname: {type: new GraphQLNonNull(GraphQLString), description: 'The group name'},
  })
})
