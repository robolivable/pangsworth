const IndexedDb = require('./indexeddb')

class Cache {
  constructor (db, table) {
    this.db = db
    this.table = table
  }

  async get (key) { return this.db.get(this.table, key) }
  async getAll (...args) { return this.db.getAll(this.table, ...args) }
  async set (key, value) {
    const o = {}
    if (Object.prototype.hasOwnProperty.call(value, 'id')) {
      o.__id = value.id
    }
    const v = Object.assign(o, value, { id: key })
    return this.db.set(this.table, v)
  }

  query () { /* TODO: indexes/queries */ }

  static async withIndexedDb (table) {
    const indexed = await IndexedDb.New()
    const cache = new Cache(indexed, table)
    return cache
  }
}

module.exports = Cache
