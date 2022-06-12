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

const elasticlunr = require('elasticlunr')
const config = require('../config')

let ElasticLunrInstance

class ElasticLunr {
  constructor (instance, cache, fromCache = false) {
    this.instance = instance
    this.cache = cache
    this.fromCache = fromCache
  }

  setRef (...args) { this.instance.setRef(...args) }
  addField (...args) { this.instance.addField(...args) }
  updateDoc (...args) { this.instance.updateDoc(...args) }
  search (...args) { return this.instance.search(...args) }

  async persistIndex (version) {
    const payload = JSON.stringify(this.instance)
    await this.cache.set(config.SEARCH_INDEX_CACHE_KEY, { payload })
    await this.cache.set(config.SEARCH_INDEX_CACHE_CHECK_KEY, { version })
  }

  async persistedIndexVersion () {
    const payload = await this.cache.get(config.SEARCH_INDEX_CACHE_CHECK_KEY)
    if (!payload) {
      return -1
    }
    return payload.version
  }

  static async withCache (cache) {
    let loadedFromCache = false
    if (!ElasticLunrInstance) {
      const cachedIndex = await cache.get(config.SEARCH_INDEX_CACHE_KEY)
      try {
        const payload = JSON.parse(cachedIndex.payload)
        ElasticLunrInstance = elasticlunr.Index.load(payload)
        loadedFromCache = true
      } catch (_) {
        console.info('no index cached, creating new one')
        ElasticLunrInstance = elasticlunr()
        ElasticLunrInstance.saveDocument(false) // reduce memory pressure
      }
    }
    const el = new ElasticLunr(ElasticLunrInstance, cache, loadedFromCache)
    return el
  }
}

module.exports = ElasticLunr
