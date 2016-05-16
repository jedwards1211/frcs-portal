import {createSelector} from 'reselect'

/**
 * This is kind of a hack, it ensures that react-router will recompute the current routes whenever the output of
 * selectState(store.getState()) changes.  This is necessary to make dynamic routing work when returning different
 * routes depending on the store state.
 * @param history a history implementation from react-router
 * @param store a redux sture
 * @param selectState a selector that is passed store.getState() and should return a new value each time you want to
 * recompute the current routes
 * @returns a reconstituted version of history that notifies its listeners with a new history each time selectState
 * returns a new value.
 */
export default function storeHistory(history, store, selectState) {
  let updateCount = 0
  let listeners = []
  let location
  let unlisten

  const selectUpdateCount = createSelector(
    selectState,
    () => updateCount++
  )

  const getCurrentLocation = createSelector(
    () => location,
    () => selectUpdateCount(store.getState()),
    location => ({...location})
  )

  const onChange = createSelector(
    getCurrentLocation,
    location => listeners.forEach(listener => listener(location))
  )


  return Object.assign({}, history, {
    listen: listener => {
      listeners.push(listener)
      if (listeners.length === 1) {
        const unlistenStore = store.subscribe(onChange)
        const unlistenHistory = history.listen(nextLocation => {
          location = nextLocation
          onChange()
        })
        unlisten = () => {
          unlistenHistory()
          unlistenStore()
        }
      }
      return () => {
        listeners.splice(listeners.indexOf(listener), 1)
        if (listeners.length === 0 && unlisten) {
          unlisten()
          unlisten = null
        }
      }
    }
  })
}
