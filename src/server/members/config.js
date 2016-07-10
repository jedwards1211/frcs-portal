import fs from 'fs'
import logger from '../logger'

const config = JSON.parse(fs.readFileSync(process.env.MEMBERS_CONFIG_FILE, 'utf8'))

;['googleSheets', 'memberSheet'].forEach(key => {
  if (!config[key]) {
    logger.error('missing members config value: ', key) 
    process.exit(1)
  }
})

;['id', 'range', 'nameIndex', 'emailAddressIndex'].forEach(key => {
  if (config.memberSheet[key] == null) {
    logger.error('missing members config value: ', `memberSheet.${key}`) 
    process.exit(1)
  }  
})

export default config
