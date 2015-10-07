import {PropTypes} from 'react';

export const comparison = PropTypes.oneOf(['low', 'high']);
export const severity   = PropTypes.oneOf(['alarm', 'warning']);

export const alarm = PropTypes.shape({
  comparison: comparison.isRequired,
  severity:   severity.isRequired,
  enabled:    PropTypes.bool,
  setpoint:   PropTypes.number,
});

export const alarms = PropTypes.arrayOf(alarm.isRequired);

export const metadataItem = PropTypes.shape({
  name:       PropTypes.string,
  units:      PropTypes.string,
  min:        PropTypes.number,
  max:        PropTypes.number,
  precision:  PropTypes.number,
});

export const alarmLegend = PropTypes.shape({
  min:        PropTypes.number,
  max:        PropTypes.number,
  alarms:     alarms,
});

export default {
  name:       PropTypes.string,
  value:      PropTypes.number,
  units:      PropTypes.string,
  min:        PropTypes.number,
  max:        PropTypes.number,
  precision:  PropTypes.number,
  alarms:     alarms,
  alarmState: severity,
};