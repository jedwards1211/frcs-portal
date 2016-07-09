/* @flow */

import _ from 'lodash'
import {createReducer} from 'mindfront-redux-utils'
import combineImmutableReducers from '../../reducers/combineImmutableReducers'

import type {Reducer} from '../../flowtypes/reduxTypes'

export default function createMongoSingletonCollectionReducer(collectionInitialStates: {[name: string]: any}): Reducer {
  let reducers = {}
  for (let name in collectionInitialStates) {
    let actionType = 'SET_' + _.snakeCase(name).toUpperCase()
    reducers[name] = createReducer(collectionInitialStates[name], {
      [actionType]: (state, action) => action.payload && action.payload.get('singleton')
    })
  }
  return combineImmutableReducers(reducers)
}
