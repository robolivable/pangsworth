const config = require('./config')
const { GalaResource } = require('./gala')

class GameObject {
  constructor ({ name = '' }, props = {}) {
    this.resource = new GalaResource(name)
    this.props = props
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

  async fetch () {
    this.props = await this.resource.get(this.resourceUri)
  }
}

class GameObjectCollection {
  constructor (clazz, { name = '' }) {
    this.objectMap = {}
    this.collection = []
    this.resource = new GalaResource(name)
  }

  // eslint-disable-next-line
  get (id) { return new this.clazz(this.collection[this.objectMap[id]]) }
  * iter () {
    for (const object of this.collection) {
      yield new this.clazz(object) // eslint-disable-line
    }
  }

  async fetch () {
    this.collection = await this.resource.getAll()
    for (const key in this.collection) {
      const object = this.collection[key]
      this.objectMap[object.__id || object.id] = key
    }
  }

  get length () {
    return this.collection.length
  }
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
    const name = Monsters.type.name
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
    const name = Classes.type.name
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
