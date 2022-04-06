class Node {
  constructor (value = null) {
    this.value = value
    this.next = null
  }
}

class Queue {
  constructor () {
    this.length = 0
    this.head = null
    this.tail = null
  }

  enqueue (item) {
    if (!this.tail) {
      this.head = new Node(item)
      this.tail = this.head
      this.length = this.length + 1
      return
    }
    const node = new Node(item)
    this.tail.next = node
    this.tail = node
    this.length = this.length + 1
  }

  dequeue () {
    if (!this.head) {
      return undefined
    }
    const node = this.head
    this.head = this.head.next
    this.length = this.length - 1
    if (!this.length) {
      this.tail = null
    }
    return node.value
  }

  push (...args) {
    for (const arg of args) {
      this.enqueue(arg)
    }
  }

  shift () {
    return this.dequeue()
  }

  static from (arrayLike) {
    const queue = new Queue()
    for (const item of arrayLike) {
      queue.enqueue(item)
    }
    return queue
  }
}

module.exports = Queue
