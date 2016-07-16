import mailgun from 'mailgun.js'
import logger from '../logger'

;['MAILGUN_API_KEY', 'EMAIL_DOMAIN', 'EMAIL_SENDER_NAME', 'EMAIL_USER'].forEach(v => {
  if (!process.env[v]) {
    console.warn('missing required environment variable: ', v)
  }
})

const {MAILGUN_API_KEY, EMAIL_DOMAIN, EMAIL_SENDER_NAME, EMAIL_USER} = process.env

const mg = mailgun.client({username: 'api', key: MAILGUN_API_KEY})

async function sendEmail(options) {
  const email = {
    from: `${EMAIL_SENDER_NAME} <${EMAIL_USER}@${EMAIL_DOMAIN}>`,
    ...options
  }
  logger.log('[email] ', email)
  return mg.messages.create(EMAIL_DOMAIN, email).then(res => {
    logger.log('[email] ', res)
    return res
  }).catch(err => {
    logger.error('[email] ', err)
    throw err
  })
}

export default sendEmail
