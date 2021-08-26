const config = require('./config')

const dbMigration = idb.open(config.CACHE_NAME, config.CACHE_VERSION, db => {
  switch (db.oldVersion) {
    case 0:
    case 1:
      for (const resourceType of Object.values(config.API_RESOURCE_TYPES)) {
        if (!resourceType.cache) {
          continue
        }
        db.createObjectStore(resourceType.name, { keyPath: 'id' })
      }
  }
})

let SingletonDb

class Cache {
  constructor (db) {
    this.db = db
  }

  async get (type, key) {
    const tx = this.db.transaction(type.name, 'readonly')
    const store = tx.objectStore(type.name)
    return store.get(key)
  }

  async set (type, value) {
    const tx = this.db.transaction(type.name, 'readwrite')
    const store = tx.objectStore(type.name)
    store.put(value)
    return tx.complete
  }

  query () { /* TODO: indexes/queries */ }

  static async withIndexedDb () {
    if (!SingletonDb) {
      SingletonDb = await dbMigration()
    }
    const cache = new Cache(SingletonDb)
    return cache
  }
}

module.exports = Cache
