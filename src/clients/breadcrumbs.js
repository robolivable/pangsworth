class Navigation {
  constructor (route, key = '', name = '') {
    this.route = route
    this.key = key
    this.name = name || route
  }

  get id () { return `${this.route}:${this.key}` }
  toString () { return this.name }
  get serialized () { return this.toJSON() }

  toJSON () {
    return {
      route: this.route,
      key: this.key,
      name: this.name
    }
  }

  static fromJSON (j) { return new Navigation(j.route, j.key, j.name) }
}

class Crumb {
  constructor (navigation, prev = null) {
    this.navigation = navigation
    this.next = null
    this.prev = prev
  }

  get id () { return this.navigation.id }
}

class Breadcrumbs {
  constructor (navigation) {
    this.head = new Crumb(navigation)
    this.current = this.head
  }

  isCurrent (crumb) { return crumb.id === this.current.id }

  * iter () {
    let node = this.head
    while (node) {
      yield node
      node = node.next
    }
  }

  navigateTo (navigation) {
    this.current.next = new Crumb(navigation, this.current)
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
  Breadcrumbs
}
