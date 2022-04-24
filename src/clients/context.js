const { GalaResource } = require('./gala')
const { getGameObjectsByTypeName } = require('./game-objects')
const { Settings } = require('./settings')
const { Breadcrumbs } = require('./breadcrumbs')

const config = require('./config')
const Search = require('./search')
const EventEmitter = require('events')

const storageSetCacheLoading = value => chrome.storage.local.set({
  [config.STORAGE_VALUE_KEYS.local.cacheLoading]: value
})

const BuiltinEvents = {
  ASK_RERENDER: 'askRerender'
}

class Context extends EventEmitter {
  constructor (defaultRoute, ...args) {
    super(...args)
    this.gameData = {}
    const hydratableResourceNames = Object.values(config.API_RESOURCE_TYPES)
      .filter(o => o.hydrate).map(o => o.name)
    for (const name of hydratableResourceNames) {
      const GameObjects = getGameObjectsByTypeName(name)
      const GameObjectCollection = GameObjects[1]
      this.gameData[name] = new GameObjectCollection()
    }
    this.settings = new Settings()
    this.breadcrumbs = Breadcrumbs.fromRoute(defaultRoute)
    this.initialized = false
  }

  get currentNavigation () { return this.breadcrumbs.current.navigation }

  async _initStartup () {
    if (this.settings.get(config.SETTINGS_VALUE_KEYS.backgroundImageLoading)) {
      await chrome.runtime.sendMessage({
        type: config.MESSAGE_VALUE_KEYS.preloadImages
      })
    }
    const breadcrumbs = this.settings.get(config.STORAGE_VALUE_KEYS.sync.breadcrumbs)
    if (breadcrumbs) {
      this.breadcrumbs = Breadcrumbs.fromJSON(breadcrumbs)
    }
    // add additional checks here
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
      this.initialized = true
    } catch (error) {
      console.error('error initializing pang context', { error })
    }
    await storageSetCacheLoading(false)
  }

  askRerender () { this.emit(BuiltinEvents.ASK_RERENDER) }

  get Settings () { return this.settings }

  async fetchSettings () {
    await this.settings.fetch()
  }

  async saveSettings () {
    await this.settings.persist()
  }

  get Classes () {
    return this.gameData[config.API_RESOURCE_TYPES.classes.name]
  }

  get Worlds () {
    return this.gameData[config.API_RESOURCE_TYPES.world.name]
  }

  get Monsters () {
    return this.gameData[config.API_RESOURCE_TYPES.monsters.name]
  }

  get Items () {
    return this.gameData[config.API_RESOURCE_TYPES.items.name]
  }

  get EquipmentSets () {
    return this.gameData[config.API_RESOURCE_TYPES.equipmentSets.name]
  }

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

module.exports = Context
module.exports.default = Context
