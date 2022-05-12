const { GalaResource } = require('./gala')

const config = require('./config')
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
  * images () {}

  get (key) {
    if (this.props[key] === undefined || this.props[key] === null) {
      return null
    }
    return this.props[key]
  }

  _findKeyphrases (props, l10n) {
    const proc = JSQueue.from(Object.keys(props))
    while (proc.length) {
      const currentKey = proc.dequeue()
      const currentValue = props[currentKey]
      if (!currentValue) {
        continue
      }
      if (i18nUtils.isLocalizableProp(currentKey)) {
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

  async index (l10n = i18nUtils.getDefaultLocale()) {
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
    this.collectionName = name
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

  toString () {
    return `<${this.prototype.constructor} collection: ${this.collectionName}>`
  }
}

class GameChildObject {
  constructor (parentObj, props = {}) {
    this.parent = parentObj
    this.props = props
  }

  get isEmpty () { return !Object.keys(this.props).length }

  get (key) {
    if (this.props[key] === undefined || this.props[key] === null) {
      return null
    }
    return this.props[key]
  }

  toJSON () { return this.props }

  get root () {
    let root = this
    while (root.parent) {
      root = root.parent
    }
    return root
  }
}

class Polygon extends GameChildObject {}

class Continent extends GameChildObject {
  get polygon () {
    const polygon = this.get('polygon')
    if (!polygon) {
      return null
    }
    return new Polygon(this, polygon)
  }
}

class Location extends GameChildObject {
  get world () {
    const worldId = this.get('world')
    if (!worldId) {
      return null
    }
    return new World({ id: worldId })
  }

  async fetchContinent () {
    const continentId = this.get('continent')
    if (!continentId) {
      return null
    }
    const world = await this.world.fetch()
    return world.continent(continentId, this)
  }
}

class Spawn extends Location {}

class Place extends GameChildObject {
  get location () {
    const locationProps = this.get('location')
    if (!locationProps) {
      return null
    }
    return new Location(this, locationProps)
  }
}

class Lodestar extends Place {}

class Ability extends GameChildObject {
  get skill () {
    const skillId = this.get('skill')
    if (!skillId) {
      return null
    }
    return new Skill({ id: skillId })
  }
}

class ScalingParameter extends GameChildObject {}

class Level extends GameChildObject {
  * abilities () {
    for (const ability of this.get('abilities') || []) {
      yield new Ability(this, ability)
    }
  }

  * scalingParameters () {
    for (const scalingParameter of this.get('scalingParameters') || []) {
      yield new ScalingParameter(this, scalingParameter)
    }
  }
}

class SkillRequirement extends GameChildObject {
  get skill () {
    const skillId = this.get('skill')
    if (!skillId) {
      return null
    }
    return new Skill({ id: skillId })
  }
}

class Bonus extends GameChildObject {
  get ability () {
    const ability = this.get('ability')
    if (!ability) {
      return null
    }
    return new Ability(this, ability)
  }
}

class Attack extends GameChildObject {
  get triggerSkill () {
    const skillId = this.get('triggerSkill')
    if (!skillId) {
      return null
    }
    return new Skill({ id: skillId })
  }
}

class Drop extends GameChildObject {
  get item () {
    const itemId = this.get('item')
    if (!itemId) {
      return null
    }
    return new Item({ id: itemId })
  }
}

class Shop extends GameChildObject {
  * items () {
    for (const itemId of this.get('items') || []) {
      yield new Item({ id: itemId })
    }
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

  * images () {
    for (const [x, y] of this.imageCodes()) {
      yield config.API_RESOURCE_TYPES.world.api.image(this.props.tileName, x, y)
    }
  }

  * imageCodes () {
    const tilesX = this.props?.width / this.props?.tileSize
    const tilesY = this.props?.height / this.props?.tileSize
    for (let x = 0; x < tilesX; ++x) {
      for (let y = 0; y < tilesY; ++y) {
        yield [x, y]
      }
    }
  }

  * continents () {
    for (const continent of this.get('continents') || []) {
      yield new Continent(this, continent)
    }
  }

  continent (continentId, parentInst = this) {
    for (const continent of this.get('continents') || []) {
      if (continent.id !== continentId) {
        continue
      }
      return new Continent(parentInst, continent)
    }
    return null
  }

  get revivalWorld () {
    const worldId = this.get('revivalWorld')
    if (!worldId) {
      return null
    }
    return new World({ id: worldId })
  }

  * places () {
    for (const place of this.get('places') || []) {
      yield new Place(this, place)
    }
  }

  * lodestars () {
    for (const lodestar of this.get('lodestars') || []) {
      yield new Lodestar(this, lodestar)
    }
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

  get icon () {
    return config.API_RESOURCE_TYPES.monsters.api.image(this.props.icon)
  }

  * images () {
    yield config.API_RESOURCE_TYPES.monsters.api.image(this.props.icon)
  }

  * attacks () {
    for (const attack of this.get('attacks') || []) {
      yield new Attack(this, attack)
    }
  }

  * drops () {
    for (const drop of this.get('drops') || []) {
      yield new Drop(this, drop)
    }
  }

  get location () {
    const locationProps = this.get('location')
    if (!locationProps) {
      return null
    }
    return new Location(this, locationProps)
  }

  * spawns () {
    for (const spawn of this.get('spawns') || []) {
      yield new Spawn(this, spawn)
    }
  }

  get booty () {
    const bootyId = this.get('booty')
    if (!bootyId) {
      return null
    }
    return new Item({ id: bootyId })
  }

  get mineral () {
    const mineralId = this.get('mineral')
    if (!mineralId) {
      return null
    }
    return new Item({ id: mineralId })
  }

  * summoned () {
    for (const monsterId of this.get('summoned') || []) {
      yield new Monster({ id: monsterId })
    }
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

  get icon () { return this.iconStyled() }

  iconStyled (style = config.API_RESOURCE_TYPES.classes.iconStyles.target) {
    return config.API_RESOURCE_TYPES.classes.api.image(style, this.props.icon)
  }

  * images () {
    const iconStyles = config.API_RESOURCE_TYPES.classes.iconStyles
    for (const style of Object.values(iconStyles)) {
      yield this.iconStyled(style)
    }
  }

  get parentClass () {
    const parentId = this.get('parent')
    if (!parentId) {
      return null
    }
    return new Class({ id: parentId })
  }
}

class Classes extends GameObjectCollection {
  constructor () {
    const name = Class.type.name
    super(Class, { name })
  }

  static get ranks () {
    return {
      Vagrant: 0,
      Mercenary: 1,
      Assist: 2,
      Acrobat: 3,
      Magician: 4,
      Blade: 5,
      Knight: 6,
      Billposter: 7,
      Ringmaster: 8,
      Jester: 9,
      Ranger: 10,
      Psykeeper: 11,
      Elementor: 12
    }
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

  get icon () {
    return config.API_RESOURCE_TYPES.items.api.image(this.props.icon)
  }

  * images () {
    yield config.API_RESOURCE_TYPES.items.api.image(this.props.icon)
  }

  * abilities () {
    for (const ability of this.get('abilities') || []) {
      yield new Ability(this, ability)
    }
  }

  * spawns () {
    for (const spawn of this.get('spawns') || []) {
      yield new Spawn(this, spawn)
    }
  }

  get class () {
    const classId = this.get('class')
    if (!classId) {
      return null
    }
    return new Class({ id: classId })
  }

  get transy () {
    const transyId = this.get('transy')
    if (!transyId) {
      return null
    }
    return new Item({ id: transyId })
  }

  get triggerSkill () {
    const skillId = this.get('triggerSkill')
    if (!skillId) {
      return null
    }
    return new Skill({ id: skillId })
  }

  get blinkwingTarget () {
    const blinkwingTarget = this.get('blinkwingTarget')
    if (!blinkwingTarget) {
      return null
    }
    return new Location(this, blinkwingTarget)
  }

  get location () {
    const locationProps = this.get('location')
    if (!locationProps) {
      return null
    }
    return new Location(this, locationProps)
  }
}

class Items extends GameObjectCollection {
  constructor () {
    const name = Item.type.name
    super(Item, { name })
  }

  static get rarityRanks () {
    // common < uncommon < rare < unique < veryrare
    return {
      common: 0, // least
      uncommon: 1,
      rare: 2,
      unique: 3,
      veryrare: 4
    }
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

  * parts () {
    for (const id of this.get('parts') || []) {
      yield new Item({ id })
    }
  }

  * bonuses () {
    for (const bonus of this.get('bonuses') || []) {
      yield new Bonus(this, bonus)
    }
  }

  async partsHydrated () {
    const parts = []
    for (const id of this.get('parts')) {
      const part = new Item({ id })
      await part.fetch()
      parts.push(part)
    }
    return parts
  }

  get transy () {
    const transyId = this.get('transy')
    if (!transyId) {
      return null
    }
    return new EquipmentSet({ id: transyId })
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

  get icon () { return this.iconStyled() }

  iconStyled (style = config.API_RESOURCE_TYPES.skills.iconStyles.old) {
    return config.API_RESOURCE_TYPES.skills.api.image(style, this.props.icon)
  }

  * images () {
    const iconStyles = config.API_RESOURCE_TYPES.skills.iconStyles
    for (const style of Object.values(iconStyles)) {
      yield this.iconStyled(style)
    }
  }

  get class () {
    const classId = this.get('class')
    if (!classId) {
      return null
    }
    return new Class({ id: classId })
  }

  get triggerSkill () {
    const skillId = this.get('triggerSkill')
    if (!skillId) {
      return null
    }
    return new Skill({ id: skillId })
  }

  * requirements () {
    for (const requirement of this.get('requirements') || []) {
      yield new SkillRequirement(this, requirement)
    }
  }

  * levels () {
    for (const level of this.get('levels') || []) {
      yield new Level(this, level)
    }
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

  get image () {
    return config.API_RESOURCE_TYPES.npcs.api.image(this.props.image)
  }

  * images () {
    yield config.API_RESOURCE_TYPES.npcs.api.image(this.props.image)
  }

  * locations () {
    for (const locationProps of this.get('locations') || []) {
      yield new Location(this, locationProps)
    }
  }

  * shop () {
    for (const shop of this.get('shop') || []) {
      yield new Shop(this, shop)
    }
  }
}

class NPCs extends GameObjectCollection {
  constructor () {
    const name = NPC.type.name
    super(NPC, { name })
  }
}

class PartySkill extends GameObject {
  constructor (props) {
    const name = PartySkill.type.name
    super({ name }, props)
  }

  static get type () { return config.API_RESOURCE_TYPES.partySkills }
  get type () { return PartySkill.type }

  get resourceUri () {
    return config.API_RESOURCE_TYPES.partySkills.api.getById(this.id)
  }

  get icon () { return this.iconStyled() }

  iconStyled (style = config.API_RESOURCE_TYPES.partySkills.iconStyles.old) {
    return config.API_RESOURCE_TYPES.partySkills.api.image(style, this.props.icon)
  }

  * images () {
    const iconStyles = config.API_RESOURCE_TYPES.partySkills.iconStyles
    for (const style of Object.values(iconStyles)) {
      yield this.iconStyled(style)
    }
  }
}

class PartySkills extends GameObjectCollection {
  constructor () {
    const name = PartySkill.type.name
    super(PartySkill, { name })
  }
}

class QuestPart extends GameChildObject {
  get quest () {
    const questId = this.get('quest')
    if (!questId) {
      return null
    }
    return new Quest({ id: questId })
  }
}

class QuestItem extends GameChildObject {
  get item () {
    const itemId = this.get('item')
    if (!itemId) {
      return null
    }
    return new Item({ id: itemId })
  }
}

class QuestMonster extends GameChildObject {
  get monster () {
    const monsterId = this.get('monster')
    if (!monsterId) {
      return null
    }
    return new Monster({ id: monsterId })
  }
}

class Quest extends GameObject {
  constructor (props) {
    const name = Quest.type.name
    super({ name }, props)
  }

  static get type () { return config.API_RESOURCE_TYPES.quests }
  get type () { return Quest.type }

  get resourceUri () {
    return config.API_RESOURCE_TYPES.quests.api.getById(this.id)
  }

  * beginClasses () {
    for (const classId of this.get('beginClasses') || []) {
      yield new Class({ id: classId })
    }
  }

  * beginQuests () {
    for (const beginQuest of this.get('beginQuests') || []) {
      yield new QuestPart(this, beginQuest)
    }
  }

  * beginReceiveItems () {
    for (const beginRecieveItem of this.get('beginReceiveItems') || []) {
      yield new QuestItem(this, beginRecieveItem)
    }
  }

  * endNeededItems () {
    for (const endNeededItem of this.get('endNeededItems') || []) {
      yield new QuestItem(this, endNeededItem)
    }
  }

  * endReceiveItems () {
    for (const endReceiveItem of this.get('endReceiveItems') || []) {
      yield new QuestItem(this, endReceiveItem)
    }
  }

  * endRemoveItems () {
    for (const endRemoveItem of this.get('endRemoveItems') || []) {
      yield new QuestItem(this, endRemoveItem)
    }
  }

  * endKillMonsters () {
    for (const endKillMonster of this.get('endKillMonsters') || []) {
      yield new QuestMonster(this, endKillMonster)
    }
  }

  get parentQuest () {
    const id = this.get('parent')
    if (!id) {
      return null
    }
    return new Quest({ id })
  }

  get beginNPC () {
    const id = this.get('beginNPC')
    if (!id) {
      return null
    }
    return new NPC({ id })
  }

  get endNPC () {
    const id = this.get('endNPC')
    if (!id) {
      return null
    }
    return new NPC({ id })
  }

  get endTalkNPC () {
    const id = this.get('endTalkNPC')
    if (!id) {
      return null
    }
    return new NPC({ id })
  }

  get endVisitPlace () {
    const endVisitPlace = this.get('endVisitPlace')
    if (!endVisitPlace) {
      return null
    }
    return new Spawn(this, endVisitPlace)
  }
}

class Quests extends GameObjectCollection {
  constructor () {
    const name = Quest.type.name
    super(Quest, { name })
  }
}

class Karma extends GameObject {
  constructor (props) {
    const name = Karma.type.name
    super({ name }, props)
  }

  static get type () { return config.API_RESOURCE_TYPES.karma }
  get type () { return Karma.type }

  get resourceUri () {
    return config.API_RESOURCE_TYPES.karma.api.getById(this.id)
  }
}

class Karmas extends GameObjectCollection {
  constructor () {
    const name = Karma.type.name
    super(Karma, { name })
  }
}

class Achievement extends GameObject {
  constructor (props) {
    const name = Achievement.type.name
    super({ name }, props)
  }

  static get type () { return config.API_RESOURCE_TYPES.achievements }
  get type () { return Achievement.type }

  get resourceUri () {
    return config.API_RESOURCE_TYPES.achievements.api.getById(this.id)
  }

  * levels () {
    for (const level of this.get('levels') || []) {
      yield new Level(this, level)
    }
  }

  get mainMonster () {
    const mainMonsterId = this.get('mainMonster')
    if (!mainMonsterId) {
      return null
    }
    return new Monster({ id: mainMonsterId })
  }

  * monsters () {
    for (const monsterId of this.get('monsters') || []) {
      yield new Monster({ id: monsterId })
    }
  }

  get mainItem () {
    const id = this.get('mainItem')
    if (!id) {
      return null
    }
    return new Item({ id })
  }

  * items () {
    for (const itemId of this.get('items') || []) {
      yield new Item({ id: itemId })
    }
  }

  get mainSkill () {
    const id = this.get('mainSkill')
    if (!id) {
      return null
    }
    return new Skill({ id })
  }

  * skills () {
    for (const skillId of this.get('skills') || []) {
      yield new Skill({ id: skillId })
    }
  }

  get mainClass () {
    const id = this.get('mainClass')
    if (!id) {
      return null
    }
    return new Class({ id })
  }

  * classes () {
    for (const classId of this.get('classes') || []) {
      yield new Class({ id: classId })
    }
  }
}

class Achievements extends GameObjectCollection {
  constructor () {
    const name = Achievement.type.name
    super(Achievement, { name })
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
    case config.API_RESOURCE_TYPES.partySkills.name:
      return [PartySkill, PartySkills]
    case config.API_RESOURCE_TYPES.quests.name:
      return [Quest, Quests]
    case config.API_RESOURCE_TYPES.karma.name:
      return [Karma, Karmas]
    case config.API_RESOURCE_TYPES.achievements.name:
      return [Achievement, Achievements]
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
  PartySkill,
  PartySkills,
  Quest,
  Quests,
  Karma,
  Karmas,
  Achievement,
  Achievements,
  getGameObjectsByTypeName
}
