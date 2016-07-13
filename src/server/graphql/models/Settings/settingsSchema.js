import {GraphQLString, GraphQLObjectType, GraphQLNonNull} from 'graphql'

const MemberSpreadsheet = new GraphQLObjectType({
  name: 'MemberSpreadsheet',
  description: 'Settings for the member spreadsheet',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLString), description: 'The Google Spreadsheet id'},
    directorySheetId: {type: new GraphQLNonNull(GraphQLString), description: 'The id of the member directory subsheet'},
    journalSheetId: {type: new GraphQLNonNull(GraphQLString), description: 'The id of the accounting journal subsheet'}
  })
})

export const Settings = new GraphQLObjectType({
  name: 'Settings',
  description: 'Various parameters that the client bundle needs',
  fields: () => ({
    memberSpreadsheet: {type: new GraphQLNonNull(MemberSpreadsheet), description: 'Member spreadsheet information'}
  })
})
