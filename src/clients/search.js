const Cache = require('./cache')
const config = require('./config')
const ElasticLunr = require('./elasticlunr')
const {
  getGameObjectsByTypeName
} = require('./game-objects')

const SEARCH_TABLE = 'search'
const DOCUMENT_REF_NAME = 'id'

// primary indexes are dynamic, can be added as we go
const PRIMARY_INDEXES = {
  name: true,
  title: true,
  description: true,
  dialogsBegin: true,
  dialogsAccept: true,
  dialogsDecline: true,
  dialogsComplete: true,
  dialogsFail: true
}
const INCLUDE_PROP_INDEXES = [
  flying: true,
  pk: true,
  town: true
]
const INDEX_SECONDARY = '__idx__'

const stripDuplicates = a => {
  const o = {}
  for (const v of a) {
    o[v] = true
  }
  return Object.keys(o)
}

class Keyphrases {
  constructor (docId, docType) {
    this.docId = docId
    this.docType = docType
    this.indexes = { [INDEX_SECONDARY]: [] }
  }

  addIndex (name, value) {
    if (name === DOCUMENT_REF_NAME) {
      this.indexes[INDEX_SECONDARY].push(value)
      return
    }
    if (!this.indexes[name]) {
      this.indexes[name] = []
    }
    this.indexes[name].push(value)
  }

  get index () {
    const idx = {
      [DOCUMENT_REF_NAME]: `${this.docId}:${this.docType}`,
      [INDEX_SECONDARY]: ''
    }
    for (const [index, values] of Object.entries(this.indexes)) {
      // primary (dynamic) indexes take up a property slot
      if (PRIMARY_INDEXES[index]) {
        idx[index] = stripDuplicates(values).join(', ')
        continue
      }
      // all other values are indexed under the secondary index
      idx[INDEX_SECONDARY] =
        [idx[INDEX_SECONDARY], stripDuplicates(values).join(', ')].join(', ')
    }
    return idx
  }
}

let SearchInstance

class Search {
  constructor (elasticlunr) {
    this.elasticlunr = elasticlunr
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
      const GameObjectCollection = getGameObjectsByTypeName(name)[1]
      const gameObjectCollection = new GameObjectCollection()
      await gameObjectCollection.fetch()
      for (const gameObject of gameObjectCollection.iter()) {
        const keyphrases = gameObject.keyphrases()
        this.elasticlunr.updateDoc(keyphrases.index())
      }
    }
    await this.elasticlunr.persistIndex()
  }

  static async New () {
    if (!SearchInstance) {
      const cache = await Cache.withIndexedDb(SEARCH_TABLE)
      const elasticlunr = await ElasticLunr.withCache(cache)
      elasticlunr.setRef(DOCUMENT_REF_NAME)
      elasticlunr.addField(INDEX_SECONDARY)
      for (const field of Object.keys(PRIMARY_INDEXES)) {
        elasticlunr.addField(field)
      }
      SearchInstance = new Search(elasticlunr)
    }
    return SearchInstance
  }
}

module.exports = {
  Keyphrases,
  Search
}
