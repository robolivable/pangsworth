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
const nodeFetch = require('node-fetch')
const fetch = require('fetch-retry')(nodeFetch, config.REQUEST_RETRY_OPTIONS)

const config = require('./config')
const Cache = require('./cache')

class GalaResource {
  constructor (type) {
    this.type = type
  }

  async hydrateCache () {
    if (!this.type.cache) {
      return
    }
    const cache = await Cache.withIndexedDb()
    const {version, lastChecked} = await cache.get(
      config.API_RESOURCE_TYPES.versions, this.type.name
    )
    const skipHydrate = lastChecked &&
      Date.now() - lastChecked >= config.API_VERSION_CHECK_INTERVAL_MS
    if (skipHydrate) {
      return
    }
    const liveVersionUri = config.API_RESOURCE_TYPES.versions.api.get()
    const liveVersionUrl = `${config.API_BASE_URL}${liveVersionUri}`
    const liveVersion = await (await fetch(liveVersionUrl)).json()
    if (version === liveVersion) {
      return
    }
    const lastVersionCheck = Date.now()
    const newVersion = {version: liveVersion, lastChecked: lastVersionCheck}
    await cache.set(
      config.API_RESOURCE_TYPES.versions, this.type.name, newVersion
    )

    const resourceIdsUri = this.type.api.ids()
    const resourceIdsUrl = `${config.API_BASE_URL}${resourceIdsUri}`
    const ids = await (await fetch(resourceIdsUrl)).json()

    const resourceUri = this.type.api.getByIds(ids)
    const resourceUrl = `${config.API_BASE_URL}${resourceUri}`
    const resourcePayload = await (await fetch(resourceUrl)).json()

    for (const value of resourcePayload) {
      await cache.set(this.type, value)
    }

    return cache
  } 

  get (key) {
    if (!this.type.cache) {
      const resourceUri = this.type.api.get()
      const resourceUrl = `${config.API_BASE_URL}${resourceUri}`
      return await (await fetch(resourceUrl)).json()
    }
    const cache = await this.hydrateCache()
    return await cache.get(this.type, key)
  }

  imageUrl (...args) {
    const resourceUri = this.type.api.image(...args)
    return `${config.API_BASE_URL}${resourceUri}`
  }
}

class GameObject {
  constructor (table, props = {}) {
    this._properties = {}
    this.properties = props
  }
}

class GameObjectCollection {}
