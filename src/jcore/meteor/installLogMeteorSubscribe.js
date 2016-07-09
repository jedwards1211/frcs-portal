import {install} from './logMeteorSubscribe'
if ('production' !== process.env.NODE_ENV) {
  install()
}
