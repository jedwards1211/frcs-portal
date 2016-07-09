/* @flow */

import React, {Component} from 'react'
import classNames from 'classnames'
import _ from 'lodash'

import Alert from '../bootstrap/Alert.jsx'
import Toast from './Toast'
import Spinner from './Spinner'

import './AlarmNotificationToast.sass'

import type {ErrorMessage} from '../flowtypes/ErrorMessage'

type Props = {
  alarmNotifications?: Array<{
    acknowledged: boolean,
    alarmId: number,
    message: string,
    severity: string,
  }>,
  className?: string,
  acknowledging?: boolean,
  acknowledgeError?: ErrorMessage,
  disabled?: boolean,
  onAcknowledgeClick?: Function,
};

export default class AlarmNotificationToast extends Component {
  props: Props;
  defaultProps: {};
  render() {
    let {className, acknowledging, acknowledgeError, alarmNotifications, onAcknowledgeClick, disabled} = this.props

    let isAlarm = alarmNotifications && _.some(alarmNotifications, n => n.severity === 'alarm')

    className = classNames(className, 'mf-alarm-notification-toast')

    return <Toast {...this.props} className={className}>
      <Alert contextClass={isAlarm ? 'alarm' : 'warning'}>
        <table>
          <tbody>
            {alarmNotifications && alarmNotifications.map((notification, index) => {
              let {alarmId, severity, message} = notification
              let icon = `glyphicon-${severity === 'alarm' ? 'exclamation-sign' : 'warning-sign'}`
              return <tr key={alarmId} className={severity}>
                <td className="icon"><i className={`glyphicon ${icon}`} />&nbsp;</td>
                <td className="message">{message}</td>
                {index === 0 && <td className="acknowledge" rowSpan={alarmNotifications ? alarmNotifications.length : 1}>
                  <button type="button" className={classNames('btn', 'ack-btn', {
                    'btn-warning': !isAlarm,
                    'btn-danger': isAlarm
                  })}
                      disabled={!!(disabled || acknowledging)} onClick={onAcknowledgeClick}
                  >
                    {acknowledging ? <span><Spinner key="spinner" /> Acknowledging...</span> : 'Acknowledge'}
                  </button>
                </td>}
              </tr>
            })}
          </tbody>
        </table>
        {acknowledgeError && <Alert style={{border: 'none'}} error={acknowledgeError} />}
      </Alert>
    </Toast>
  }
}
