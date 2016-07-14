import Schema from './rootSchema'
import {graphql, validate} from 'graphql'
import {prepareClientError} from './models/utils'

export default async (req, res) => {
  // Check for admin privileges
  const {query, variables, ...newContext} = req.body
  const authToken = req.user || {}
  const context = {authToken, ...newContext}
  const result = await graphql(Schema, query, null, context, variables)
  const {error} = prepareClientError(result)
  res.send({...result, error})
}
