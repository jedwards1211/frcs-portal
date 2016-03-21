import warning from 'fbjs/lib/warning';

export default store => next => action => {
  warning(!Tracker.active, 'action %s was dispatched within a reactive computation', action.type);
  return Tracker.nonreactive(function() { return next(action); });
}; 
