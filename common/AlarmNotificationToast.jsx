/* @flow */

import React, {Component} from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import Alert from '../bootstrap/Alert.jsx';
import Toast from './Toast';
import Spinner from './Spinner';

import './AlarmNotificationToast.sass';

type Props = {
  alarmNotifications?: Array<{
    acknowledged: boolean,
    alarmId: number,
    fqChannelId: string,
    message: string,
    severity: string,
  }>,
  className?: string,
  acknowledging?: boolean,
  disabled?: boolean,
  onAcknowledgeClick?: Function,
};

export default class AlarmNotificationToast extends Component {
  props: Props;
  defaultProps: {};
  render() {
    let {className, acknowledging, alarmNotifications, onAcknowledgeClick, disabled} = this.props;

    let isAlarm = alarmNotifications && _.any(alarmNotifications, n => n.severity === 'alarm');

    className = classNames(className, 'mf-alarm-notification-toast');

    return <Toast {...this.props} className={className}>
      <Alert.Auto type={isAlarm ? 'alarm' : 'warning'}>
        <table>
          <tbody>
            {alarmNotifications && alarmNotifications.map((notification, index) => {
              let {alarmId, severity, message} = notification;
              let icon = `glyphicon-${severity === 'alarm' ? 'exclamation-sign' : 'warning-sign'}`;
              return <tr key={alarmId} className={severity}>
                <td className="icon"><i className={`glyphicon ${icon}`}/>&nbsp;</td>
                <td className="message" className="message">{message}</td>
                {index === 0 && <td className="acknowledge" rowSpan={alarmNotifications ? alarmNotifications.length : 1}>
                  <button type="button" className={classNames('btn', {'btn-warning': !isAlarm, 'btn-danger': isAlarm})}
                    disabled={!!(disabled || acknowledging)} onClick={onAcknowledgeClick}>
                    {acknowledging ? <span><Spinner key="spinner" /> Acknowledging...</span> : 'Acknowledge'}
                  </button>
                </td>}
              </tr>
            })}
          </tbody>
        </table>
      </Alert.Auto>
    </Toast>;
  }
}
