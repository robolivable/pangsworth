/*
    Pangsworth Info Butler. At your service anywhere in Madrigal.
    Copyright (C) 2021  https://github.com/robolivable

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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

  dequeueN (n = 1) {
    const ret = []
    n = parseInt(n)
    if (!n || n < 0) {
      return ret
    }
    for (let i = 0; i < n; ++i) {
      const value = this.dequeue()
      if (!value) {
        continue
      }
      ret.push(value)
    }
    return ret
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
