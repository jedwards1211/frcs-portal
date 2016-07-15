import r from './rethinkdriver'
import logger from '../logger'

// ava is the test database
const databases = ['portal', 'ava']

const database = [
  {name: 'users', indices: ['username', 'email']},
  {name: 'groups', indices: ['groupname']},
  {name: 'users_groups', indices: ['user_id', 'group_id']},
  {name: 'lanes', indices: ['userId']},
  {name: 'notes', indices: ['laneId']}
]

export default async function setupDB(isUpdate = false) {
  await Promise.all(databases.map(db => ({db, isUpdate})).map(reset))
  if (!isUpdate) await r.getPool().drain()
  logger.log(`>>Database setup complete!`)
}

async function reset({db, isUpdate}) {
  const dbList = await r.dbList()
  if (dbList.indexOf(db) === -1) {
    logger.log(`>>Creating Database: ${db}`)
    await r.dbCreate(db)
  }
  const tables = await r.db(db).tableList()
  if (!isUpdate) {
    logger.log(`>>Dropping tables in: ${db}`)
    await Promise.all(tables.map(table => r.db(db).tableDrop(table)))
  }
  await Promise.all(database.map(table => {
    if (!isUpdate || tables.indexOf(table.name) === -1) {
      logger.log(`>>Creating table ${table.name} in: ${db}`)
      return r.db(db).tableCreate(table.name)
    }
    return Promise.resolve(false)
  }))
  const tableIndicies = await Promise.all(database.map(table => {
    logger.log(`>>Adding indices on table ${table.name} in: ${db}`)
    return r.db(db).table(table.name).indexList().run()
  }))
  await Promise.all([...database.map((table, i) => {
    const indicies = tableIndicies[i] || []
    return table.indices.map(index => {
      if (indicies.indexOf(index) === -1) {
        return r.db(db).table(table.name).indexCreate(index).run()
      }
      return Promise.resolve(false)
    })
  })])
  logger.log(`>>${isUpdate ? 'Update' : 'Setup'} complete for: ${db}`)
}
