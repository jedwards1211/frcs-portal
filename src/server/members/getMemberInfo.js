/* @flow */

import google from 'googleapis'
import promisify from 'es6-promisify'
import {auth} from './googleAuth'
import config from './config'

const settings = config.memberSpreadsheet

const sheets = google.sheets('v4')
const getValues = promisify(sheets.spreadsheets.values.get, sheets.spreadsheets.values)

const notFoundMessage = "Couldn't find your e-mail address in the member records.  Please use your e-mail address from the members spreadsheet; if it is out of date, ask one of the officers to update it for you."

async function getMemberInfo(options) {
  const {email} = options

  const rows = (await getValues({
    auth: auth(),
    spreadsheetId: settings.id,
    range: settings.range
  })).values
  const row = rows.find(row => row[settings.emailAddressIndex] === email)
  if (!row) throw new Error(notFoundMessage)

  const parts = row[settings.nameIndex].trim().split(/\s*,\s*/g)

  return {
    firstName: parts[1],
    lastName: parts[0]
  }
}

export default getMemberInfo
