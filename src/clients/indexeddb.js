/*
    Pangsworth Info Butler. At your service anywhere in Madrigal.
    Copyright (C) 2021  https://github.com/robolivable

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

    You can contact the author by email at robolivable@gmail.com.
*/

const config = require('./config')
const idb = require('idb')

const dbMigration = idb.openDB(config.CACHE_NAME, config.CACHE_VERSION, {
  upgrade (db) {
    switch (db.version) {
      case 0:
      case 1:
        for (const resourceType of Object.values(config.API_RESOURCE_TYPES)) {
          if (!resourceType.cache) {
            continue
          }
          db.createObjectStore(resourceType.name, { keyPath: 'id' })
        }
    }
  }
})

let IndexedDbInstance
class IndexedDb {
  constructor (db) {
    this.db = db
  }

  async get (table, key) {
    const tx = this.db.transaction(table, 'readonly')
    const store = tx.objectStore(table)
    return store.get(key)
  }

  async getAll (table, ...args) {
    const tx = this.db.transaction(table, 'readonly')
    const store = tx.objectStore(table)
    return store.getAll(...args)
  }

  async set (table, value) {
    const tx = this.db.transaction(table, 'readwrite')
    const store = tx.objectStore(table)
    store.put(value)
    return tx.complete
  }

  static async New () {
    if (!IndexedDbInstance) {
      IndexedDbInstance = await dbMigration
    }
    const db = new IndexedDb(IndexedDbInstance)
    return db
  }
}

