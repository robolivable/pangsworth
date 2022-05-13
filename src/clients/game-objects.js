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

  get isTransparent () {
    const { id, ...rest } = this.props
    return !Object.keys(rest).length
  }

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

  async hydrate () {}
}

class Polygon extends GameChildObject {}

class Continent extends GameChildObject {
  get polygon () {
    if (this._polygon) {
      return this._polygon
    }
    const polygon = this.get('polygon')
    if (!polygon) {
      return null
    }
    this._polygon = new Polygon(this, polygon)
    return this._polygon
  }
}

class Location extends GameChildObject {
  get world () {
    if (this._world) {
      return this._world
    }
    const worldId = this.get('world')
    if (!worldId) {
      return null
    }
    this._world = new World({ id: worldId })
    return this._world
  }

  get continent () {
    if (!this._continent) {
      return null
    }
    return this._continent
  }

  async fetchContinent () {
    if (this._continent) {
      return this._continent
    }
    const continentId = this.get('continent')
    if (!continentId) {
      return null
    }
    if (this.world.isTransparent) {
      await this.world.fetch()
    }
    this._continent = this.world.continent(continentId, this)
    return this._continent
  }

  async hydrate () {
    if (this.world.isTransparent) {
      await this.world.fetch()
    }
    await this.fetchContinent()
  }
}

class Spawn extends Location {}

class Place extends GameChildObject {
  get location () {
    if (this._location) {
      return this._location
    }
    const locationProps = this.get('location')
    if (!locationProps) {
      return null
    }
    this._location = new Location(this, locationProps)
    return this._location
  }

  async hydrate () { await this.location.hydrate() }
}

class Lodestar extends Place {}

class Ability extends GameChildObject {
  get skill () {
    if (this._skill) {
      return this._skill
    }
    const skillId = this.get('skill')
    if (!skillId) {
      return null
    }
    this._skill = new Skill({ id: skillId })
    return this._skill
  }

  async hydrate () {
    if (this.skill.isTransparent) {
      await this.skill.fetch()
    }
  }
}

class ScalingParameter extends GameChildObject {}

class Level extends GameChildObject {
  * abilities () {
    if (this._abilities) {
      for (const ability of this._abilities) {
        yield ability
      }
      return
    }
    this._abilities = []
    for (const a of this.get('abilities') || []) {
      const ability = new Ability(this, a)
      this._abilities.push(ability)
      yield ability
    }
  }

  * scalingParameters () {
    if (this._scalingParameters) {
      for (const scalingParameter of this._scalingParameters) {
        yield scalingParameter
      }
      return
    }
    this._scalingParameters = []
    for (const sp of this.get('scalingParameters') || []) {
      const scalingParameter = new ScalingParameter(this, sp)
      this._scalingParameters.push(scalingParameter)
      yield scalingParameter
    }
  }

  async hydrate () {
    const promiseList = []
    for (const ability of this.abilities()) {
      promiseList.push(ability.hydrate())
    }
    for (const scalingParameter of this.scalingParameters()) {
      promiseList.push(scalingParameter.hydrate())
    }
    await Promise.all(promiseList)
  }
}

class SkillRequirement extends GameChildObject {
  get skill () {
    if (this._skill) {
      return this._skill
    }
    const skillId = this.get('skill')
    if (!skillId) {
      return null
    }
    this._skill = new Skill({ id: skillId })
    return this._skill
  }

  async hydrate () {
    if (this.skill.isTransparent) {
      await this.skill.fetch()
    }
  }
}

class Bonus extends GameChildObject {
  get ability () {
    if (this._ability) {
      return this._ability
    }
    const ability = this.get('ability')
    if (!ability) {
      return null
    }
    this._ability = new Ability(this, ability)
    return this._ability
  }

  async hydrate () { await this.ability.hydrate() }
}

class Attack extends GameChildObject {
  get triggerSkill () {
    if (this._triggerSkill) {
      return this._triggerSkill
    }
    const skillId = this.get('triggerSkill')
    if (!skillId) {
      return null
    }
    this._triggerSkill = new Skill({ id: skillId })
    return this._triggerSkill
  }

  async hydrate () {
    if (this.triggerSkill.isTransparent) {
      await this.triggerSkill.fetch()
    }
  }
}

class Drop extends GameChildObject {
  get item () {
    if (this._item) {
      return this._item
    }
    const itemId = this.get('item')
    if (!itemId) {
      return null
    }
    this._item = new Item({ id: itemId })
    return this._item
  }

  async hydrate () {
    if (this.item.isTransparent) {
      await this.item.fetch()
    }
  }
}

class Shop extends GameChildObject {
  * items () {
    if (!this._items) {
      this._items = {}
    }
    for (const itemId of this.get('items') || []) {
      if (this._items[itemId]) {
        yield this._items[itemId]
        continue
      }
      this._items[itemId] = new Item({ id: itemId })
      yield this._items[itemId]
    }
  }

  async hydrate () {
    const promiseList = []
    for (const item of this.items()) {
      if (item.isTransparent) {
        promiseList.push(item.fetch())
      }
    }
    await Promise.all(promiseList)
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
    if (this._continents) {
      for (const continent of this._continents) {
        yield continent
      }
      return
    }
    this._continents = []
    for (const c of this.get('continents') || []) {
      const continent = new Continent(this, c)
      this._continents.push(continent)
      yield continent
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
    if (this._revivalWorld) {
      return this._revivalWorld
    }
    const worldId = this.get('revivalWorld')
    if (!worldId) {
      return null
    }
    this._revivalWorld = new World({ id: worldId })
    return this._revivalWorld
  }

  * places () {
    if (this._places) {
      for (const place of this._places) {
        yield place
      }
      return
    }
    this._places = []
    for (const p of this.get('places') || []) {
      const place = new Place(this, p)
      this._places.push(place)
      yield place
    }
  }

  * lodestars () {
    if (this._lodestars) {
      for (const lodestar of this._lodestars) {
        yield lodestar
      }
      return
    }
    this._lodestars = []
    for (const l of this.get('lodestars') || []) {
      const lodestar = new Lodestar(this, l)
      this._lodestars.push(lodestar)
      yield lodestar
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
    if (this._attacks) {
      for (const attack of this._attacks) {
        yield attack
      }
      return
    }
    this._attacks = []
    for (const a of this.get('attacks') || []) {
      const attack = new Attack(this, a)
      this._attacks.push(attack)
      yield attack
    }
  }

  * drops () {
    if (this._drops) {
      for (const drop of this._drops) {
        yield drop
      }
      return
    }
    this._drops = []
    for (const d of this.get('drops') || []) {
      const drop = new Drop(this, d)
      this._drops.push(drop)
      yield drop
    }
  }

  get location () {
    if (this._location) {
      return this._location
    }
    const locationProps = this.get('location')
    if (!locationProps) {
      return null
    }
    this._location = new Location(this, locationProps)
    return this._location
  }

  * spawns () {
    if (this._spawns) {
      for (const spawn of this._spawns) {
        yield spawn
      }
      return
    }
    this._spawns = []
    for (const s of this.get('spawns') || []) {
      const spawn = new Spawn(this, s)
      this._spawns.push(spawn)
      yield spawn
    }
  }

  get booty () {
    if (this._booty) {
      return this._booty
    }
    const bootyId = this.get('booty')
    if (!bootyId) {
      return null
    }
    this._booty = new Item({ id: bootyId })
    return this._booty
  }

  get mineral () {
    if (this._mineral) {
      return this._mineral
    }
    const mineralId = this.get('mineral')
    if (!mineralId) {
      return null
    }
    this._mineral = new Item({ id: mineralId })
    return this._mineral
  }

  * summoned () {
    if (!this._summoned) {
      this._summoned = {}
    }
    for (const monsterId of this.get('summoned') || []) {
      if (this._summoned[monsterId]) {
        yield this._summoned[monsterId]
        continue
      }
      this._summoned[monsterId] = new Monster({ id: monsterId })
      yield this._summoned[monsterId]
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
    if (this._parentClass) {
      return this._parentClass
    }
    const parentId = this.get('parent')
    if (!parentId) {
      return null
    }
    this._parentClass = new Class({ id: parentId })
    return this._parentClass
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
    if (this._abilities) {
      for (const ability of this._abilities) {
        yield ability
      }
      return
    }
    this._abilities = []
    for (const a of this.get('abilities') || []) {
      const ability = new Ability(this, a)
      this._abilities.push(ability)
      yield ability
    }
  }

  * spawns () {
    if (this._spawns) {
      for (const spawn of this._spawns) {
        yield spawn
      }
      return
    }
    this._spawns = []
    for (const s of this.get('spawns') || []) {
      const spawn = new Spawn(this, s)
      this._spawns.push(spawn)
      yield spawn
    }
  }

  get class () {
    if (this._class) {
      return this._class
    }
    const classId = this.get('class')
    if (!classId) {
      return null
    }
    this._class = new Class({ id: classId })
    return this._class
  }

  get transy () {
    if (this._transy) {
      return this._transy
    }
    const transyId = this.get('transy')
    if (!transyId) {
      return null
    }
    this._transy = new Item({ id: transyId })
    return this._transy
  }

  get triggerSkill () {
    if (this._triggerSkill) {
      return this._triggerSkill
    }
    const skillId = this.get('triggerSkill')
    if (!skillId) {
      return null
    }
    this._triggerSkill = new Skill({ id: skillId })
    return this._triggerSkill
  }

  get blinkwingTarget () {
    if (this._blinkwingTarget) {
      return this._blinkwingTarget
    }
    const blinkwingTarget = this.get('blinkwingTarget')
    if (!blinkwingTarget) {
      return null
    }
    this._blinkwingTarget = new Location(this, blinkwingTarget)
    return this._blinkwingTarget
  }

  get location () {
    if (this._location) {
      return this._location
    }
    const locationProps = this.get('location')
    if (!locationProps) {
      return null
    }
    this._location = new Location(this, locationProps)
    return this._location
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
    if (!this._parts) {
      this._parts = {}
    }
    for (const itemId of this.get('parts') || []) {
      if (this._parts[itemId]) {
        yield this._parts[itemId]
        continue
      }
      this._parts[itemId] = new Item({ id: itemId })
      yield this._parts[itemId]
    }
  }

  * bonuses () {
    if (this._bonuses) {
      for (const bonus of this._bonuses) {
        yield bonus
      }
      return
    }
    this._bonuses = []
    for (const b of this.get('bonuses') || []) {
      const bonus = new Bonus(this, b)
      this._bonuses.push(bonus)
      yield bonus
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
    if (this._transy) {
      return this._transy
    }
    const transyId = this.get('transy')
    if (!transyId) {
      return null
    }
    this._transy = new EquipmentSet({ id: transyId })
    return this._transy
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
    if (this._class) {
      return this._class
    }
    const classId = this.get('class')
    if (!classId) {
      return null
    }
    this._class = new Class({ id: classId })
    return this._class
  }

  get triggerSkill () {
    if (this._triggerSkill) {
      return this._triggerSkill
    }
    const skillId = this.get('triggerSkill')
    if (!skillId) {
      return null
    }
    this._triggerSkill = new Skill({ id: skillId })
    return this._triggerSkill
  }

  * requirements () {
    if (this._requirements) {
      for (const requirement of this._requirements) {
        yield requirement
      }
      return
    }
    this._requirements = []
    for (const r of this.get('requirements') || []) {
      const requirement = new SkillRequirement(this, r)
      this._requirements.push(requirement)
      yield requirement
    }
  }

  * levels () {
    if (this._levels) {
      for (const level of this._levels) {
        yield level
      }
      return
    }
    this._levels = []
    for (const l of this.get('levels') || []) {
      const level = new Level(this, l)
      this._levels.push(level)
      yield level
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
    if (this._locations) {
      for (const loc of this._locations) {
        yield loc
      }
      return
    }
    this._locations = []
    for (const l of this.get('locations') || []) {
      const loc = new Location(this, l)
      this._locations.push(loc)
      yield loc
    }
  }

  * shop () {
    if (this._shop) {
      for (const shop of this._shop) {
        yield shop
      }
      return
    }
    this._shop = []
    for (const s of this.get('shop') || []) {
      const shop = new Shop(this, s)
      this._shop.push(shop)
      yield shop
    }
  }

  async hydrate () {
    const promiseList = []
    for (const loc of this.locations()) {
      promiseList.push(loc.hydrate())
    }
    for (const shop of this.shop()) {
      promiseList.push(shop.hydrate())
    }
    await Promise.all(promiseList)
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
    if (this._quest) {
      return this._quest
    }
    const questId = this.get('quest')
    if (!questId) {
      return null
    }
    this._quest = new Quest({ id: questId })
    return this._quest
  }
}

class QuestItem extends GameChildObject {
  get item () {
    if (this._item) {
      return this._item
    }
    const itemId = this.get('item')
    if (!itemId) {
      return null
    }
    this._item = new Item({ id: itemId })
    return this._item
  }
}

class QuestMonster extends GameChildObject {
  get monster () {
    if (this._monster) {
      return this._monster
    }
    const monsterId = this.get('monster')
    if (!monsterId) {
      return null
    }
    this._monster = new Monster({ id: monsterId })
    return this._monster
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
    if (!this._beginClasses) {
      this._beginClasses = {}
    }
    for (const classId of this.get('beginClasses') || []) {
      if (this._beginClasses[classId]) {
        yield this._beginClasses[classId]
        continue
      }
      this._beginClasses[classId] = new Class({ id: classId })
      yield this._beginClasses[classId]
    }
  }

  * beginQuests () {
    if (this._beginQuests) {
      for (const questPart of this._beginQuests) {
        yield questPart
      }
      return
    }
    this._beginQuests = []
    for (const q of this.get('beginQuests') || []) {
      const questPart = new QuestPart(this, q)
      this._beginQuests.push(questPart)
      yield questPart
    }
  }

  * beginReceiveItems () {
    if (this._beginReceieveItems) {
      for (const questItem of this._beginReceieveItems) {
        yield questItem
      }
      return
    }
    this._beginReceieveItems = []
    for (const q of this.get('beginReceiveItems') || []) {
      const questItem = new QuestItem(this, q)
      this._beginReceieveItems.push(questItem)
      yield questItem
    }
  }

  * endNeededItems () {
    if (this._endNeededItems) {
      for (const questItem of this._endNeededItems) {
        yield questItem
      }
      return
    }
    this._endNeededItems = []
    for (const q of this.get('endNeededItems') || []) {
      const questItem = new QuestItem(this, q)
      this._endNeededItems.push(questItem)
      yield questItem
    }
  }

  * endReceiveItems () {
    if (this._endReceiveItems) {
      for (const questItem of this._endReceiveItems) {
        yield questItem
      }
      return
    }
    this._endReceiveItems = []
    for (const q of this.get('endReceiveItems') || []) {
      const questItem = new QuestItem(this, q)
      this._endReceiveItems.push(questItem)
      yield questItem
    }
  }

  * endRemoveItems () {
    if (this._endRemoveItems) {
      for (const questItem of this._endRemoveItems) {
        yield questItem
      }
      return
    }
    this._endRemoveItems = []
    for (const q of this.get('endRemoveItems') || []) {
      const questItem = new QuestItem(this, q)
      this._endRemoveItems.push(questItem)
      yield questItem
    }
  }

  * endKillMonsters () {
    if (this._endKillMonsters) {
      for (const questMonster of this._endKillMonsters) {
        yield questMonster
      }
      return
    }
    this._endKillMonsters = []
    for (const q of this.get('endKillMonsters') || []) {
      const questMonster = new QuestMonster(this, q)
      this._endKillMonsters.push(questMonster)
      yield questMonster
    }
  }

  get parentQuest () {
    if (this._parentQuest) {
      return this._parentQuest
    }
    const id = this.get('parent')
    if (!id) {
      return null
    }
    this._parentQuest = new Quest({ id })
    return this._parentQuest
  }

  get beginNPC () {
    if (this._beginNPC) {
      return this._beginNPC
    }
    const id = this.get('beginNPC')
    if (!id) {
      return null
    }
    this._beginNPC = new NPC({ id })
    return this._beginNPC
  }

  get endNPC () {
    if (this._endNPC) {
      return this._endNPC
    }
    const id = this.get('endNPC')
    if (!id) {
      return null
    }
    this._endNPC = new NPC({ id })
    return this._endNPC
  }

  get endTalkNPC () {
    if (this._endTalkNPC) {
      return this._endTalkNPC
    }
    const id = this.get('endTalkNPC')
    if (!id) {
      return null
    }
    this._endTalkNPC = new NPC({ id })
    return this._endTalkNPC
  }

  get endVisitPlace () {
    if (this._endVisitPlace) {
      return this._endVisitPlace
    }
    const endVisitPlace = this.get('endVisitPlace')
    if (!endVisitPlace) {
      return null
    }
    this._endVisitPlace = new Spawn(this, endVisitPlace)
    return this._endVisitPlace
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
    if (this._levels) {
      for (const level of this._levels) {
        yield level
      }
      return
    }
    this._levels = []
    for (const l of this.get('levels') || []) {
      const level = new Level(this, l)
      this._levels.push(level)
      yield level
    }
  }

  get mainMonster () {
    if (this._mainMonster) {
      return this._mainMonster
    }
    const mainMonsterId = this.get('mainMonster')
    if (!mainMonsterId) {
      return null
    }
    this._mainMonster = new Monster({ id: mainMonsterId })
    return this._mainMonster
  }

  * monsters () {
    if (!this._monsters) {
      this._monsters = {}
    }
    for (const monsterId of this.get('monsters') || []) {
      if (this._monsters[monsterId]) {
        yield this._monsters[monsterId]
        continue
      }
      this._monsters[monsterId] = new Monster({ id: monsterId })
      yield this._monsters[monsterId]
    }
  }

  get mainItem () {
    if (this._mainItem) {
      return this._mainItem
    }
    const id = this.get('mainItem')
    if (!id) {
      return null
    }
    this._mainItem = new Item({ id })
    return this._mainItem
  }

  * items () {
    if (!this._items) {
      this._items = {}
    }
    for (const itemId of this.get('items') || []) {
      if (this._items[itemId]) {
        yield this._items[itemId]
        continue
      }
      this._items[itemId] = new Item({ id: itemId })
      yield this._items[itemId]
    }
  }

  get mainSkill () {
    if (this._mainSkill) {
      return this._mainSkill
    }
    const id = this.get('mainSkill')
    if (!id) {
      return null
    }
    this._mainSkill = new Skill({ id })
    return this._mainSkill
  }

  * skills () {
    if (!this._skills) {
      this._skills = {}
    }
    for (const skillId of this.get('skills') || []) {
      if (this._skills[skillId]) {
        yield this._skills[skillId]
        continue
      }
      this._skills[skillId] = new Item({ id: skillId })
      yield this._skills[skillId]
    }
  }

  get mainClass () {
    if (this._mainClass) {
      return this._mainClass
    }
    const id = this.get('mainClass')
    if (!id) {
      return null
    }
    this._mainClass = new Class({ id })
    return this._mainClass
  }

  * classes () {
    if (!this._classes) {
      this._classes = {}
    }
    for (const classId of this.get('classes') || []) {
      if (this._classes[classId]) {
        yield this._classes[classId]
        continue
      }
      this._classes[classId] = new Class({ id: classId })
      yield this._classes[classId]
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
