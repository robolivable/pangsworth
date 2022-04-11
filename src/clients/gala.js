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
*/

const config = require('./config')
const utils = require('./utils')
const nodeFetch = require('node-fetch')
const fetch = require('fetch-retry')(nodeFetch, config.REQUEST_RETRY_OPTIONS)

const Cache = require('./cache')

class GalaResource {
  constructor (name) { this.name = name }

  static async __versionCacheMiss (versionKey) {
    const versionCacheTable = config.API_RESOURCE_TYPES.versions.name
    const cache = await Cache.withIndexedDb(versionCacheTable)
    const verObj = await cache.get(versionKey)
    let liveVersion
    if (verObj && verObj.lastChecked) {
      const versionCheckDelta = Date.now() - verObj.lastChecked
      const staleLocalVersionCheck =
        versionCheckDelta >= config.API_VERSION_CHECK_INTERVAL_MS

      if (!staleLocalVersionCheck) {
        return false
      }

      const liveVersionUri = config.API_RESOURCE_TYPES.versions.api.get()
      const liveVersionUrl = `${config.API_BASE_URL}${liveVersionUri}`
      liveVersion = await (await fetch(liveVersionUrl)).json()
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

  static async _versionCacheMiss (...args) {
    const cacheMiss = await GalaResource.__versionCacheMiss(...args)
    console.debug({ cacheMiss })
    return cacheMiss
  }

  static async hydrateMainCacheObjects () {
    await GalaResource._hydrateMainCacheObjects()
  }

  static async _hydrateMainCacheObjects () {
    for (const [name, resource] of Object.entries(config.API_RESOURCE_TYPES)) {
      if (!resource.hydrate || !resource.cache) {
        continue
      }
      const cacheMiss = await GalaResource._versionCacheMiss(name)
      if (!cacheMiss) {
        continue
      }
      const cache = await Cache.withIndexedDb(name)
      const resourceIdsUri = resource.api.ids()
      const resourceIdsUrl = `${config.API_BASE_URL}${resourceIdsUri}`
      const ids = await (await fetch(resourceIdsUrl)).json()
      await utils.batch(ids, async chunk => {
        const resourceUri = resource.api.getByIds(chunk)
        const resourceUrl = `${config.API_BASE_URL}${resourceUri}`
        const resourcePayload = await (await fetch(resourceUrl)).json()
        for (const value of resourcePayload) {
          const singleResourceUri = resource.api.getById(value.id)
          const singleResourceUrl = `${config.API_BASE_URL}${singleResourceUri}`
          await cache.set(singleResourceUrl, value)
        }
      })
    }
  }

  async get (resourceUri) {
    const resourceUrl = `${config.API_BASE_URL}${resourceUri}`
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
    const fullResultPayload = await utils.batch(ids, async chunk => {
      const resourceUri = type.api.getByIds(chunk)
      const resourceUrl = `${config.API_BASE_URL}${resourceUri}`
      return (await fetch(resourceUrl)).json()
    })
    return fullResultPayload
  }
}

module.exports = {
  GalaResource
}
