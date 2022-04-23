class Navigation {
  constructor (route, key = '') {
    this.route = route
    this.key = key
  }

  toJSON () {
    return {
      route: this.route,
      key: this.key
    }
  }
}

class Crumb {
  constructor (navigation, prev = null) {
    this.navigation = navigation
    this.next = null
    this.prev = prev
  }
}

class Breadcrumbs {
  constructor (navigation) {
    this.head = new Crumb(navigation)
    this.current = this.head
  }

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
