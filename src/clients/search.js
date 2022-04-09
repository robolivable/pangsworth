const { getGameObjectsByTypeName } = require('./game-objects')

const Cache = require('./cache')
const config = require('./config')
const ElasticLunr = require('./elasticlunr')

let SearchInstance

class Search {
  constructor (elasticlunr) {
    this.elasticlunr = elasticlunr
    this.lookup = this.lookup.bind(this)
    this.hydrateIndex = this.hydrateIndex.bind(this)
  }

  async lookup (term) {
    const referenceList = this.elasticlunr.search(term)
    const objects = []
    for (const { ref } of referenceList) {
      const [id, typeName] = ref.split(':')
      const Clazz = getGameObjectsByTypeName(typeName)[0]
      objects.push(new Clazz({ id }))
    }
    await Promise.all(objects.map(o => o.fetch()))
    return objects
  }

  async hydrateIndex () {
    for (const name of Object.keys(config.API_RESOURCE_TYPES)) {
      const GameObjects = getGameObjectsByTypeName(name)
      if (!GameObjects) {
        continue
      }
      const GameObjectCollection = GameObjects[1]
      const gameObjectCollection = new GameObjectCollection()
      await gameObjectCollection.fetch()
      for (const gameObject of gameObjectCollection.iter()) {
        await gameObject.index()
        this.elasticlunr.updateDoc(gameObject.keyphrases.index)
      }
    }
    await this.elasticlunr.persistIndex()
  }

  static async New () {
    if (!SearchInstance) {
      const cache = await Cache.withIndexedDb(config.SEARCH_TABLE)
      const elasticlunr = await ElasticLunr.withCache(cache)
      elasticlunr.setRef(config.SEARCH_DOCUMENT_REF_NAME)
      elasticlunr.addField(config.SEARCH_INDEX_SECONDARY)
      for (const field of Object.keys(config.SEARCH_PRIMARY_INDEXES)) {
        elasticlunr.addField(field)
      }
      SearchInstance = new Search(elasticlunr)
    }
    return SearchInstance
  }
}

module.exports = {
  Search
}
