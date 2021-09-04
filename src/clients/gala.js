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
const nodeFetch = require('node-fetch')
const fetch = require('fetch-retry')(nodeFetch, config.REQUEST_RETRY_OPTIONS)

const Cache = require('./cache')

class GalaResource {
  constructor (name) { this.name = name }

  static async _versionCasheMiss (versionKey) {
    const versionCacheTable = config.API_RESOURCE_TYPES.versions.name
    const cache = await Cache.withIndexedDb(versionCacheTable)
    const verObj = await cache.get(versionKey)
    if (verObj && verObj.lastChecked) {
      const versionCheckDelta = Date.now() - verObj.lastChecked
      const staleLocalVersionCheck =
        versionCheckDelta >= config.API_VERSION_CHECK_INTERVAL_MS

      if (!staleLocalVersionCheck) {
        return false
      }

      const liveVersionUri = config.API_RESOURCE_TYPES.versions.api.get()
      const liveVersionUrl = `${config.API_BASE_URL}${liveVersionUri}`
      const liveVersion = await (await fetch(liveVersionUrl)).json()
      const staleVersion = verObj.version !== liveVersion
      if (!staleVersion) {
        return false
      }
    }
    const lastVersionCheck = Date.now()
    const newVersion = {
      id: versionKey,
      version: liveVersion,
      lastChecked: lastVersionCheck
    }
    await cache.set(versionKey, newVersion)
    return true
  }

  static async hydrateMainCacheObjects () {
    for (const [name, resource] of Object.entries(config.API_RESOURCE_TYPES)) {
      if (!resource.type.hydrate || !resource.type.cache) {
        continue
      }
      const cacheMiss = await GalaResource._versionCasheMiss(name)
      if (!cacheMiss) {
        continue
      }
      const cache = await Cache.withIndexedDb(name)
      const resourceIdsUri = resource.type.api.ids()
      const resourceIdsUrl = `${config.API_BASE_URL}${resourceIdsUri}`
      const ids = await (await fetch(resourceIdsUrl)).json()
      const resourceUri = resource.type.api.getByIds(ids)
      const resourceUrl = `${config.API_BASE_URL}${resourceUri}`
      const resourcePayload = await (await fetch(resourceUrl)).json()
      for (const value of resourcePayload) {
        await cache.set(resourceUrl, value)
      }
    }
    return cache
  }

  async get (resourceUrl) {
    const cache = await Cache.withIndexedDb(this.name)
    const result = await cache.get(resourceUrl)
    const versionCacheMiss = GalaResource._versionCacheMiss(this.name)
    if (result && !versionCacheMiss) {
      return result
    }
    if (versionCacheMiss) {
      // NOTE: we trigger an async rehydration if version is outdated
      GalaResource.hydrateMainCacheObjects()
    }
    return (await fetch(resourceUrl)).json()
  }

  async getAll () {
    const cache = await Cache.withIndexedDb(this.name)
    const result = await cache.getAll()
    const versionCacheMiss = GalaResource._versionCacheMiss(this.name)
    if (result.length && !versionCacheMiss) {
      return result
    }
    if (versionCacheMiss) {
      // NOTE: we trigger an async rehydration if version is outdated
      GalaResource.hydrateMainCacheObjects()
    }
    const type = config.API_RESOURCE_TYPES[this.name]
    const resourceIdsUri = type.api.ids()
    const resourceIdsUrl = `${config.API_BASE_URL}${resourceIdsUri}`
    const ids = await (await fetch(resourceIdsUrl)).json()
    const resourceUri = type.api.getByIds(ids)
    const resourceUrl = `${config.API_BASE_URL}${resourceUri}`
    return (await fetch(resourceUrl)).json()
  }
}

class GameObject {
  constructor ({name = ''}, props = {}) {
    this.resource = new GalaResource(name)
    this.props = props
  }

  get id () { return this.props.__id || this.props.id }
  get resourceId () { throw new Error('must implement resourceId getter') }
  get isEmpty () { return !Object.keys(this.props).length }

  get (key) {
    if (this.props[key] === undefined || this.props[key] === null) {
      return null
    }
    return this.props[key]
  }

  async fetch () {
    this.props = await this.resource.get(this.resourceId)
  }
}

class GameObjectCollection {
  constructor (clazz, {name = ''}) {
    this.objectMap = {}
    this.collection = []
    this.resource = new GalaResource(name)
  }

  get (id) { return new this.clazz(this.collection[this.objectMap[id]]) }
  * iter () {
    for (const object of this.collection) {
      yield new this.clazz(object)
    }
  }

  async fetch () {
    this.collection = await this.resource.getAll()
    for (const key in this.collection) {
      const object = this.collection[key]
      this.objectMap[object.__id || object.id] = key
    }
  }

  get length () {
    return this.collection.length
  }
}

module.exports = {
  GalaResource,
  GameObject,
  GameObjectCollection
}
