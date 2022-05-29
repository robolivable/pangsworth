const utils = require('../utils')

class Navigation {
  constructor (route, key = '', name = '', icon = '', nameColor = '') {
    this.route = route
    this.key = key
    this.name = name || route
    this.icon = icon
    this.nameColor = nameColor
  }

  get id () { return `${this.route}:${this.key}:${this.name}` }
  toString () { return this.name }
  get serialized () { return this.toJSON() }
  get Route () { return utils.capitalize(this.route) }
  equals (navigation) {
    return JSON.stringify(navigation.toJSON()) === JSON.stringify(this.toJSON())
  }

  toJSON () {
    return {
      route: this.route,
      key: this.key,
      name: this.name,
      icon: this.icon,
      nameColor: this.nameColor
    }
  }

  static fromJSON (j) { return new Navigation(j.route, j.key, j.name, j.icon) }
}

class Crumb {
  constructor (navigation, prev = null) {
    this.navigation = navigation
    this.next = null
    this.prev = prev
  }

  get id () { return this.navigation.id }
  equals (crumb) { return this.navigation.equals(crumb.navigation) }
}

class Breadcrumbs {
  constructor (navigation) {
    this.head = new Crumb(navigation)
    this.current = this.head
  }

  isCurrent (crumb) { return crumb.equals(this.current) }

  * iter () {
    let node = this.head
    while (node) {
      yield node
      node = node.next
    }
  }

  navigateTo (navigation) {
    const crumb = new Crumb(navigation, this.current)
    if (this.current.equals(crumb)) {
      return
    }
    this.current.next = crumb
    this.current = this.current.next
  }

  jumpTo (crumb) {
    this.current = crumb
  }

  resetWith (route) {
    this.head = new Crumb(new Navigation(route))
    this.current = this.head
  }

  toJSON () {
    const json = []
    for (const node of this.iter()) {
      json.push(node.navigation.toJSON())
    }
    return json
  }

  static fromJSON (json) {
    const [head, ...nodes] = json
    const breadcrumbs = new Breadcrumbs(new Navigation(head.route, head.key))
    for (const node of nodes) {
      breadcrumbs.navigateTo(new Navigation(node.route, node.key))
    }
    return breadcrumbs
  }

  static fromRoute (navigationRoute) {
    return new Breadcrumbs(new Navigation(navigationRoute))
  }
}

module.exports = {
  Breadcrumbs,
  Navigation
}
