const { GalaResource } = require('./gala')

const config = require('./config')
const i18nConfig = require('../i18n/config')
const i18nUtils = require('../i18n/utils')
const JSQueue = require('./js-queue')
const utils = require('./utils')

class Keyphrases {
  constructor (docId, docType) {
    this.docId = docId
    this.docType = docType
    this.indexes = { [config.SEARCH_INDEX_SECONDARY]: [] }
  }

  addIndex (name, value) {
    if (name === config.SEARCH_DOCUMENT_REF_NAME) {
      this.indexes[config.SEARCH_INDEX_SECONDARY].push(value)
      return
    }
    if (config.SEARCH_INCLUDE_PROP_INDEXES[name]) {
      // we want to associate these values with their prop names instead
      this.indexes[config.SEARCH_INDEX_SECONDARY].push(name)
      return
    }
    if (!this.indexes[name]) {
      this.indexes[name] = []
    }
    this.indexes[name].push(value)
  }

  get index () {
    const idx = {
      [config.SEARCH_DOCUMENT_REF_NAME]: `${this.docId}:${this.docType}`,
      [config.SEARCH_INDEX_SECONDARY]: ''
    }
    for (const [index, values] of Object.entries(this.indexes)) {
      // primary (dynamic) indexes take up a property slot
      if (config.SEARCH_PRIMARY_INDEXES[index]) {
        idx[index] = utils.stripArrayDuplicates(values).join(', ')
        continue
      }
      // all other values are indexed under the secondary index
      idx[config.SEARCH_INDEX_SECONDARY] = [
        idx[config.SEARCH_INDEX_SECONDARY],
        utils.stripArrayDuplicates(values).join(', ')
      ].filter(v => v).join(', ')
    }
    return idx
  }
}

class GameObject {
  constructor ({ name = '' }, props = {}) {
    this.resource = new GalaResource(name)
    this.props = props
    this.keyphrases = new Keyphrases(this.id, this.type.name)
  }

  get id () { return this.props.__id || this.props.id }
  get resourceUri () { throw new Error('must implement resourceUri getter') }
  get isEmpty () { return !Object.keys(this.props).length }

  get (key) {
    if (this.props[key] === undefined || this.props[key] === null) {
      return null
    }
    return this.props[key]
  }

  _findKeyphrases (props, l10n = i18nConfig.defaultLocale) {
    const proc = JSQueue.from(Object.keys(props))
    while (proc.length) {
      const currentKey = proc.dequeue()
      const currentValue = props[currentKey]
      if (!currentValue) {
        continue
      }
      if (i18nConfig.LOCALIZABLE_PROPS[currentKey]) {
        const localizedKeyphrase = currentValue[l10n.id]
        this.keyphrases.addIndex(currentKey, localizedKeyphrase)
        continue
      }
      if (utils.isObject(currentValue)) {
        proc.push(...Object.keys(currentValue))
        continue
      }
      if (utils.isArrayOfObjects(currentValue)) {
        for (const p of currentValue) {
          this._findKeyphrases(p, l10n)
        }
        continue
      }
      if (Array.isArray(currentValue)) {
        // flatten arrays of primitives
        this.keyphrases.addIndex(currentKey, currentValue.join(', '))
        continue
      }
      this.keyphrases.addIndex(currentKey, currentValue)
    }
  }

  async index() {
    const l10n = await i18nUtils.getLocalization()
    this._findKeyphrases(this.props, l10n)
  }

  async fetch () {
    this.props = await this.resource.get(this.resourceUri)
    return this
  }

  toJSON () { return this.props }
}

class GameObjectCollection {
  constructor (clazz, { name = '' }) {
    this.clazz = clazz
    this.objectMap = {}
    this.collection = []
    this.resource = new GalaResource(name)
  }

  // eslint-disable-next-line
  get (id) { return new this.clazz(this.collection[this.objectMap[id]]) }
  * iter () {
    for (const object of this.collection) {
      if (Object.prototype.hasOwnProperty(object, 'prototype')) { // eslint-disable-line
        yield object
        continue
      }
      yield new this.clazz(object) // eslint-disable-line
    }
  }

  async fetch () {
    this.collection = await this.resource.getAll()
    for (const key in this.collection) {
      const object = this.collection[key]
      this.objectMap[object.__id || object.id] = key
    }
    return this
  }

  get length () { return this.collection.length }

  toJSON () { return this.collection }
}

class World extends GameObject {
  constructor (props) {
    const name = World.type.name
    super({ name }, props)
  }

  get type () { return World.type }
  static get type () { return config.API_RESOURCE_TYPES.world }

  get resourceUri () {
    return config.API_RESOURCE_TYPES.world.api.getById(this.id)
  }
}

class Worlds extends GameObjectCollection {
  constructor () {
    const name = World.type.name
    super(World, { name })
  }
}

class Monster extends GameObject {
  constructor (props) {
    const name = Monster.type.name
    super({ name }, props)
  }

  static get type () { return config.API_RESOURCE_TYPES.monsters }
  get type () { return Monster.type }

  get resourceUri () {
    return config.API_RESOURCE_TYPES.monsters.api.getById(this.id)
  }
}

class Monsters extends GameObjectCollection {
  constructor () {
    const name = Monster.type.name
    super(Monster, { name })
  }
}

class Class extends GameObject {
  constructor (props) {
    const name = Class.type.name
    super({ name }, props)
  }

  static get type () { return config.API_RESOURCE_TYPES.classes }
  get type () { return Class.type }
  get resourceUri () {
    return config.API_RESOURCE_TYPES.classes.api.getById(this.id)
  }
}

class Classes extends GameObjectCollection {
  constructor () {
    const name = Class.type.name
    super(Class, { name })
  }
}

class Item extends GameObject {
  constructor (props) {
    const name = Item.type.name
    super({ name }, props)
  }

  static get type () { return config.API_RESOURCE_TYPES.items }
  get type () { return Item.type }
  get resourceUri () {
    return config.API_RESOURCE_TYPES.items.api.getById(this.id)
  }
}

class Items extends GameObjectCollection {
  constructor () {
    const name = Item.type.name
    super(Item, { name })
  }
}

class EquipmentSet extends GameObject {
  constructor (props) {
    const name = EquipmentSet.type.name
    super({ name }, props)
  }

  static get type () { return config.API_RESOURCE_TYPES.equipmentSets }
  get type () { return EquipmentSet.type }
  get resourceUri () {
    return config.API_RESOURCE_TYPES.equipmentSets.api.getById(this.id)
  }
}

class EquipmentSets extends GameObjectCollection {
  constructor () {
    const name = EquipmentSet.type.name
    super(EquipmentSet, { name })
  }
}

class Skill extends GameObject {
  constructor (props) {
    const name = Skill.type.name
    super({ name }, props)
  }

  static get type () { return config.API_RESOURCE_TYPES.skills }
  get type () { return Skill.type }
  get resourceUri () {
    return config.API_RESOURCE_TYPES.skills.api.getById(this.id)
  }
}

class Skills extends GameObjectCollection {
  constructor () {
    const name = Skill.type.name
    super(Skill, { name })
  }
}

class NPC extends GameObject {
  constructor (props) {
    const name = NPC.type.name
    super({ name }, props)
  }

  static get type () { return config.API_RESOURCE_TYPES.npcs }
  get type () { return NPC.type }
  get resourceUri () {
    return config.API_RESOURCE_TYPES.npcs.api.getById(this.id)
  }
}

class NPCs extends GameObjectCollection {
  constructor () {
    const name = NPC.type.name
    super(NPC, { name })
  }
}

const getGameObjectsByTypeName = typeName => {
  switch (typeName) {
    case config.API_RESOURCE_TYPES.classes.name:
      return [Class, Classes]
    case config.API_RESOURCE_TYPES.world.name:
      return [World, Worlds]
    case config.API_RESOURCE_TYPES.monsters.name:
      return [Monster, Monsters]
    case config.API_RESOURCE_TYPES.items.name:
      return [Item, Items]
    case config.API_RESOURCE_TYPES.equipmentSets.name:
      return [EquipmentSet, EquipmentSets]
    case config.API_RESOURCE_TYPES.skills.name:
      return [Skill, Skills]
    case config.API_RESOURCE_TYPES.npcs.name:
      return [NPC, NPCs]
    default:
  }
}

module.exports = {
  GameObject,
  GameObjectCollection,
  World,
  Worlds,
  Monster,
  Monsters,
  Class,
  Classes,
  Item,
  Items,
  EquipmentSet,
  EquipmentSets,
  Skill,
  Skills,
  NPC,
  NPCs,
  getGameObjectsByTypeName
}
