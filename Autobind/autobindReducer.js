export default function autobindReducer(state, action) {
  if (action.meta && action.meta.autobindField) {
    let {payload, meta: {reduxPath, autobindPath, autobindField}} = action;
    return state.setIn([...(reduxPath || []), ...(autobindPath || []), autobindField], payload);
  }
  return state;
}
