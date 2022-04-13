const { GalaResource } = require('./gala')
const { getGameObjectsByTypeName } = require('./game-objects')

const config = require('./config')
const Search = require('./search')

class Context {
  constructor () {
    this.gameData = {}
    const hydratableResourceNames = Object.values(config.API_RESOURCE_TYPES)
      .filter(o => o.hydrate).map(o => o.name)
    for (const name of hydratableResourceNames) {
      const GameObjects = getGameObjectsByTypeName(name)
      const GameObjectCollection = GameObjects[1]
      this.gameData[name] = new GameObjectCollection()
    }
    this.initialized = false
  }

  async initialize () {
    if (this.initialized) {
      return
    }
    await chrome.storage.local.set({
      [config.STORAGE_VALUE_KEYS.cacheLoading]: true
    })
    try {
      await GalaResource.hydrateMainCacheObjects()
      this.searchClient = await Search.New()
      await this.searchClient.hydrateIndex()
      for (const gameObjectCollection of Object.values(this.gameData)) {
        await gameObjectCollection.fetch()
      }
      this.initialized = true
    } catch (error) {
      console.error('error initializing pang context', { error })
    }
    await chrome.storage.local.set({
      [config.STORAGE_VALUE_KEYS.cacheLoading]: false
    })
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
}

module.exports = Context
module.exports.default = Context
