import {reduce, forEach, mapValues, keys, identity} from 'lodash'
import * as Immutable from 'immutable'
import {createReducer, composeReducers} from 'mindfront-redux-utils'
import warning from 'warning'

function combineImmutableReducersBase(reducers) {
  if (!keys(reducers).length) return identity
  let result = (state = Immutable.Map(), action) => state.withMutations(mutableState => reduce(
    reducers,
    (nextState, reducer, key) => nextState.update(key, value => reducer(value, action)),
    mutableState))
  result.domainHandlers = reducers
  return result
}

export default function combineImmutableReducers(reducers) {
  let actionHandlers = {}
  let otherReducers = {}
  let initialState = Immutable.Map()
  forEach(reducers, (reducer, key) => {
    if (reducer.initialState) {
      initialState = initialState.set(key, reducer.initialState)
    }
    if (reducer.actionHandlers) {
      // invert from prop name -> action type -> reducer
      //          to action type -> prop name -> reducer
      forEach(reducer.actionHandlers, (actionHandler, type) => {
        (actionHandlers[type] || (actionHandlers[type] = {}))[key] = actionHandler
      })
    }
    else {
      warning(true, 'reducer does not have actionHandlers: %s', reducer)
      otherReducers[key] = reducer
    }
  })

  let composed = composeReducers(
    createReducer(initialState, mapValues(actionHandlers, combineImmutableReducersBase)),
    combineImmutableReducersBase(otherReducers)
  )

  let firstRun = true
  return (state = initialState, action) => {
    if (firstRun) {
      firstRun = false
      state = state.withMutations(state => {
        initialState.forEach((initValue, key) => {
          state.update(key, value => value || initValue)
        })
      })
    }
    return composed(state, action)
  }
}


