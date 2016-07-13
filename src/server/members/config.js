import fs from 'fs'
import logger from '../logger'

const config = JSON.parse(fs.readFileSync(process.env.MEMBERS_CONFIG_FILE, 'utf8'))

;['googleSheets', 'memberSpreadsheet'].forEach(key => {
  if (!config[key]) {
    logger.error('missing members config value: ', key) 
    process.exit(1)
  }
})

;['id', 'directorySheetId', 'journalSheetId', 'range', 'nameIndex', 'emailAddressIndex'].forEach(key => {
  if (config.memberSpreadsheet[key] == null) {
    logger.error('missing members config value: ', `memberSpreadsheet.${key}`) 
    process.exit(1)
  }  
})

export default config
