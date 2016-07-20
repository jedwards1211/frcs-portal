import r from './rethinkdriver'
import logger from '../logger'
import settings from '../settings'

const groups = settings.groups || []

// ava is the test database
const databases = ['portal', 'ava']

const database = [
  {name: 'users', indices: ['username', 'email']},
  {name: 'groups', indices: ['groupname']},
  {name: 'users_groups', indices: ['user_id', 'group_id']},
]

export default async function setupDB(isUpdate = false) {
  await Promise.all(databases.map(db => ({db, isUpdate})).map(reset))
  if (!isUpdate) await r.getPool().drain()
  logger.log(`>>Database setup complete!`)
}

async function reset({db, isUpdate}) {
  const dbList = await r.dbList().run()
  if (dbList.indexOf(db) === -1) {
    logger.log(`>>Creating Database: ${db}`)
    await r.dbCreate(db).run()
  }
  const tables = await r.db(db).tableList().run()
  if (!isUpdate) {
    logger.log(`>>Dropping tables in: ${db}`)
    await Promise.all(tables.map(table => r.db(db).tableDrop(table).run()))
  }
  await Promise.all(database.map(table => {
    if (!isUpdate || tables.indexOf(table.name) === -1) {
      logger.log(`>>Creating table ${table.name} in: ${db}`)
      return r.db(db).tableCreate(table.name).run()
    }
    return Promise.resolve(false)
  }))
  const tableIndicies = await Promise.all(database.map(table => {
    logger.log(`>>Adding indices on table ${table.name} in: ${db}`)
    return r.db(db).table(table.name).indexList().run()
  }))
  await Promise.all(database.map((table, i) => {
    const indicies = tableIndicies[i] || []
    return Promise.all(table.indices.map(async index => {
      if (indicies.indexOf(index) === -1) {
        await r.db(db).table(table.name).indexCreate(index).run()
        return r.db(db).table(table.name).indexWait().run()
      }
      return Promise.resolve(false)
    }))
  }))
  await Promise.all(groups.map(groupname => {
    logger.log(`>>Adding group ${groupname} in: ${db}`)
    return r.branch(r.db(db).table('groups').getAll(groupname, {index: 'groupname'}).isEmpty(),
      r.db(db).table('groups').insert({groupname}),
      { }).run()
  }))
  logger.log(`>>${isUpdate ? 'Update' : 'Setup'} complete for: ${db}`)
}
