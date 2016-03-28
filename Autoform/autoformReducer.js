export default function autoformReducer(state, action) {
  if (action.meta && action.meta.autoformField) {
    let {payload, meta: {reduxPath, autoformPath, autoformField}} = action;
    return state.setIn([...(reduxPath || []), ...(autoformPath || []), autoformField], payload);
  }
  return state;
}
