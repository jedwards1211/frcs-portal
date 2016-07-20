import fs from 'fs'
import logger from './logger'

let settings = {}

const {SETTINGS_FILE} = process.env
if (SETTINGS_FILE) {
  try {
    settings = JSON.parse(fs.readFileSync(SETTINGS_FILE))
  } catch (err) {
    logger.error('Failed to load ${SETTINGS_FILE}: ', err)
  }
}

export default settings
