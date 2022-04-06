const elasticlunr = require('elasticlunr')

const INDEX_CACHE_KEY = 'elasticlunr'

let ElasticLunrInstance

class ElasticLunr {
  constructor (instance, cache) {
    this.instance = instance
    this.cache = cache
  }

  setRef (value) { this.instance.setRef(value) }
  addField (value) { this.instance.addField(value) }
  updateDoc (value) { this.instance.updateDoc(value) }

  async persistIndex () {
    const payload = JSON.stringify(this.instance)
    await this.cache.set(INDEX_CACHE_KEY, { payload })
  }

  static async withCache (cache) {
    if (!ElasticLunrInstance) {
      const cachedIndex = await cache.get(INDEX_CACHE_KEY)
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
