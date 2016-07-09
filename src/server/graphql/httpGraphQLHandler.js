import Schema from './rootSchema'
import {graphql} from 'graphql'
import logger from '../logger'

export default async (req, res) => {
  // Check for admin privileges
  const {query, variables, ...newContext} = req.body
  const authToken = req.user || {}
  const context = {authToken, context: newContext}
  const result = await graphql(Schema, query, null, context, variables)
  if (result.errors) {
    logger.log('DEBUG GraphQL Error:', result.errors)
  }
  res.send(result)
}
