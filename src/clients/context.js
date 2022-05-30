const { GalaResource } = require('./gala')
const {
  Classes,
  Items,
  getGameObjectsByTypeName,
  getNavigationByDataItem,
  getNavigationByItem
} = require('./game-objects')
const GameSchemas = require('./game-schemas')
const { Settings } = require('./settings')
const { Breadcrumbs } = require('./breadcrumbs')

const config = require('../config')
const Search = require('./search')
const EventEmitter = require('events')

const storageSetCacheLoading = value => chrome.storage.local.set({
  [config.STORAGE_VALUE_KEYS.local.cacheLoading]: value
})

const storageSetCacheCompletedAt = value => chrome.storage.local.set({
  [config.STORAGE_VALUE_KEYS.local.imageCacheCompletedAt]: value
})

const storageGetCacheCompletedAt = async () => {
  const result = await chrome.storage.local.get([
    config.STORAGE_VALUE_KEYS.local.imageCacheCompletedAt
  ])
  return result[config.STORAGE_VALUE_KEYS.local.imageCacheCompletedAt] || 0
}

const cacheStale = (lastCheck, expiresAt) => {
  const cacheMissDelta = Date.now() - lastCheck
  return cacheMissDelta > expiresAt
}

const BuiltinEvents = {
  ASK_RERENDER: 'askRerender',
  INITIALIZE_COMPLETED: 'initializeCompleted',
  NAVIGATE_SINGLE_ITEM: 'navigateSingleItem'
}

class Context extends EventEmitter {
  constructor (defaultRoute, ...args) {
    super(...args)
    this.navigateSingleItem = this.navigateSingleItem.bind(this)
    this.navigateSingleDataItem = this.navigateSingleDataItem.bind(this)
    this.gameData = {}
    const hydratableResourceNames = Object.values(config.API_RESOURCE_TYPES)
      .filter(o => o.hydrate).map(o => o.name)
    for (const name of hydratableResourceNames) {
      const GameObjects = getGameObjectsByTypeName(name)
      const GameObjectCollection = GameObjects[1]
      this.gameData[name] = new GameObjectCollection()
    }
    this.settings = new Settings()
    this.initialized = false
    this.localStorage = {
      search: {}
    }
  }

  async _initStartup () {
    chrome.runtime.onMessage.addListener(({ type, limiter }, _, respond) => {
      if (type !== config.MESSAGE_VALUE_KEYS.preloadImagesCompleted) {
        return
      }
      storageSetCacheCompletedAt(Date.now())
      respond()
    })
    if (this.settings.get(config.SETTINGS_VALUE_KEYS.backgroundImageLoading)) {
      const lastImageCacheCompletedAt = await storageGetCacheCompletedAt()
      await chrome.runtime.sendMessage({
        type: config.MESSAGE_VALUE_KEYS.preloadImages,
        forceFetch: lastImageCacheCompletedAt && cacheStale(
          lastImageCacheCompletedAt,
          config.BG_IMG_PRELOAD.autoCacheDownloadCheckExpireMs
        )
      })
    }
    const breadcrumbs = this.settings.get(
      config.STORAGE_VALUE_KEYS.sync.breadcrumbs
    )
    if (breadcrumbs) {
      this.breadcrumbs = Breadcrumbs.fromJSON(breadcrumbs)
    }
    // add additional checks here
  }

  _generateLootAdjacencyMap () {
    this.lootAdjacency = {}
    for (const monster of this.Monsters.iter()) {
      for (const drop of monster.drops()) {
        if (!this.lootAdjacency[drop.get('item')]) {
          this.lootAdjacency[drop.get('item')] = []
        }
        this.lootAdjacency[drop.get('item')].push({
          probabilityRange: drop.probabilityRange,
          common: drop.get('common'),
          monster
        })
      }
    }
  }

  _generateShopAdjacencyMap () {
    this.shopAdjacency = {}
    for (const npc of this.NPCs.iter()) {
      for (const shop of npc.shop()) {
        shop.connectEdgesFromContext(this)
        for (const item of shop.items()) {
          if (!this.shopAdjacency[item.id]) {
            this.shopAdjacency[item.id] = []
          }
          this.shopAdjacency[item.id].push({
            shopName: shop.get('name').en, // TODO: localize
            npc
          })
        }
      }
    }
  }

  async initialize () {
    if (this.initialized) {
      return
    }
    await storageSetCacheLoading(true)
    try {
      await this.settings.fetch()
      await GalaResource.hydrateMainCacheObjects()
      await this._initStartup()
      this.searchClient = await Search.New(this.settings.localization)
      await this.searchClient.hydrateIndex()
      for (const gameObjectCollection of Object.values(this.gameData)) {
        await gameObjectCollection.fetch()
      }
      this._generateLootAdjacencyMap()
      this._generateShopAdjacencyMap()
      this.initialized = true
    } catch (error) {
      console.error('error initializing pang context', { error })
    }
    await storageSetCacheLoading(false)
    console.debug('PangContext Instance =>', this)
    this.emit(BuiltinEvents.INITIALIZE_COMPLETED)
  }

  askRerender () { this.emit(BuiltinEvents.ASK_RERENDER) }
  get Settings () { return this.settings }
  textSearch (term) { return this.searchClient.lookup(term) }

  async fetchSettings () {
    await this.settings.fetch()
  }

  async saveSettings () {
    await this.settings.persist()
  }

  async getLastCacheDownloadCompletedAt () {
    return storageGetCacheCompletedAt()
  }

  keepSearchResults (term, results) {
    this.localStorage.search.term = term
    this.localStorage.search.results = results
  }

  getSearchResults () {
    return [
      this.localStorage.search.term || '',
      this.localStorage.search.results || []
    ]
  }

  * iterAllData () {
    for (const dataObjectCollection of Object.values(this.gameData)) {
      for (const dataObject of dataObjectCollection.iter()) {
        yield dataObject
      }
    }
  }

  get currentNavigation () {
    if (!this.breadcrumbs) {
      return
    }
    return this.breadcrumbs.current.navigation
  }

  navigateSingleDataItem (dataItem) {
    const navigation = getNavigationByDataItem(dataItem)
    if (!this.breadcrumbs) {
      this.breadcrumbs = new Breadcrumbs(navigation)
    } else {
      this.breadcrumbs.navigateTo(navigation)
    }
    this.emit(BuiltinEvents.NAVIGATE_SINGLE_ITEM)
  }

  navigateSingleItem (item) {
    const navigation = getNavigationByItem(item)
    if (!this.breadcrumbs) {
      this.breadcrumbs = new Breadcrumbs(navigation)
    } else {
      this.breadcrumbs.navigateTo(navigation)
    }
    this.emit(BuiltinEvents.NAVIGATE_SINGLE_ITEM)
  }

  get Classes () {
    return this.gameData[config.API_RESOURCE_TYPES.classes.name]
  }

  get ClassRanks () { return Classes.ranks }

  get Worlds () {
    return this.gameData[config.API_RESOURCE_TYPES.world.name]
  }

  get Monsters () {
    return this.gameData[config.API_RESOURCE_TYPES.monsters.name]
  }

  get Items () {
    return this.gameData[config.API_RESOURCE_TYPES.items.name]
  }

  get ItemRarityRanks () { return Items.rarityRanks }

  get EquipmentSets () {
    return this.gameData[config.API_RESOURCE_TYPES.equipmentSets.name]
  }

  get GameSchemas () { return GameSchemas }

  get Skills () {
    return this.gameData[config.API_RESOURCE_TYPES.skills.name]
  }

  get NPCs () {
    return this.gameData[config.API_RESOURCE_TYPES.npcs.name]
  }

  get PartySkills () {
    return this.gameData[config.API_RESOURCE_TYPES.partySkills.name]
  }

  get Quests () {
    return this.gameData[config.API_RESOURCE_TYPES.quests.name]
  }

  get Karmas () {
    return this.gameData[config.API_RESOURCE_TYPES.karma.name]
  }

  get Achievements () {
    return this.gameData[config.API_RESOURCE_TYPES.achievements.name]
  }
}

Context.ASK_RERENDER = BuiltinEvents.ASK_RERENDER
Context.INITIALIZE_COMPLETED = BuiltinEvents.INITIALIZE_COMPLETED
Context.NAVIGATE_SINGLE_ITEM = BuiltinEvents.NAVIGATE_SINGLE_ITEM

module.exports = Context
module.exports.default = Context
module.exports.BuiltinEvents = BuiltinEvents
