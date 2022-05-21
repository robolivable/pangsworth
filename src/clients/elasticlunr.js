const elasticlunr = require('elasticlunr')
const config = require('./config')

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
