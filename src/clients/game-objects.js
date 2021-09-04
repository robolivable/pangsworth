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
    const name = config.API_RESOURCE_TYPES.world.name
    super({ name }, props)
  }

  get resourceUri () {
    return config.API_RESOURCE_TYPES.world.api.getById(this.id)
  }
}

module.exports = {
  World,
  GameObjectCollection
}
