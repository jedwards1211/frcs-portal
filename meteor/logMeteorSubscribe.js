/* @flow */
/* eslint-disable no-console */

import _ from 'lodash'

const formatTime = (time) => `@ ${_.padStart(time.getHours(), 2, '0')}:${_.padStart(time.getMinutes(), 2, '0')}:${_.padStart(time.getSeconds(), 2, '0')}.${_.padStart(time.getMilliseconds(), 3, '0')}`

import type {SubscriptionHandle} from '../flowtypes/meteorTypes'

const wrappedSubscribe = Meteor.subscribe

export default function logMeteorSubscribe(name: string, ...args: any[]): SubscriptionHandle {
  let actualArgs = args

  function log(detail:string):void {
    const title = `Meteor.subscribe ${formatTime(new Date())} ${name} (${detail})`
    try {
      console.group(title)
    }
    catch (e) {
      console.log(title)
    }

    actualArgs.forEach((arg, index) => console.log(`[${_.padStart(index, 2, '0')}]`, arg))

    try {
      console.groupEnd()
    } catch (e) {
      console.log(`—— log end ——`)
    }
  }

  let logCallbacks = {
    onReady: () => log('ready'),
    onStop: error => error ? log('error: ' + error.message) : log('stop')
  }

  let callbacks = args[args.length - 1]
  if (callbacks && (callbacks.onReady instanceof Function || callbacks.onStop instanceof Function)) {
    actualArgs = args.slice(0, args.length - 1)

    let {onReady, onStop} = callbacks
    callbacks = {
      onReady: () => {
        logCallbacks.onReady()
        onReady && onReady()
      },
      onStop: error => {
        logCallbacks.onStop(error)
        onStop && onStop(error)
      }
    }
  }
  else {
    callbacks = logCallbacks
  }

  log('start')

  let subHandle = wrappedSubscribe.call(Meteor, name, ...actualArgs, callbacks)

  return {
    stop() {
      log('stop')
      subHandle.stop()
    },
    ready: () => subHandle.ready(),
    subscriptionId: subHandle.subscriptionId
  }
}

export function install() {
  Meteor.subscribe = logMeteorSubscribe
}
