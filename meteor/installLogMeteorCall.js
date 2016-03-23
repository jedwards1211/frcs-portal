import {install} from './logMeteorCall';
if ('production' !== process.env.NODE_ENV) {
  install();
}
