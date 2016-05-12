/* @flow */

import _ from 'lodash'
import combineImmutableReducers from '../../reducers/combineImmutableReducers'
import {createPayloadReducer} from '../../reducers/commonReducers'

import type {Reducer} from '../../flowtypes/reduxTypes'

export default function mongoCollectionReducer(collectionInitialStates: {[name: string]: any}): Reducer {
  let reducers = {}
  for (let name in collectionInitialStates) {
    let actionType = 'SET_' + _.snakeCase(name).toUpperCase()
    reducers[name] = createPayloadReducer(collectionInitialStates[name], actionType)
  }
  return combineImmutableReducers(reducers)
}
