import logger from './logger'

module.exports.run = function () {
  logger.log('   >> Broker PID:', process.pid)
}
