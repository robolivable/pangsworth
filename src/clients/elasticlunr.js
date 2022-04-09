const elasticlunr = require('elasticlunr')
const config = require('./config')

let ElasticLunrInstance

class ElasticLunr {
  constructor (instance, cache) {
    this.instance = instance
    this.cache = cache
  }

  setRef (...args) { this.instance.setRef(...args) }
  addField (...args) { this.instance.addField(...args) }
  updateDoc (...args) { this.instance.updateDoc(...args) }
  search (...args) { return this.instance.search(...args) }

  async persistIndex () {
    const payload = JSON.stringify(this.instance)
    await this.cache.set(config.SEARCH_INDEX_CACHE_KEY, { payload })
  }

  static async withCache (cache) {
    if (!ElasticLunrInstance) {
      const cachedIndex = await cache.get(config.SEARCH_INDEX_CACHE_KEY)
      try {
        const payload = JSON.parse(cachedIndex.payload)
        ElasticLunrInstance = elasticlunr.Index.load(payload)
      } catch (_) {
        console.debug('no index cached, creating new one')
        ElasticLunrInstance = elasticlunr()
        ElasticLunrInstance.saveDocument(false) // reduce memory pressure
      }
    }
    const el = new ElasticLunr(ElasticLunrInstance, cache)
    return el
  }
}

module.exports = ElasticLunr
