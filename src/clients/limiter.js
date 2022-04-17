const EventEmitter = require('events')
const JSQueue = require('./js-queue')

const RATES = { millisecond: 1, second: 1000 }
const QUEUE_EVENT = 'enqueue'

class Limiter extends EventEmitter {
  constructor (rate, time, ...args) {
    super(...args)
    this.rate = rate
    this.time = time
    this.queue = new JSQueue()
    this.on(QUEUE_EVENT, this.proc)
    this._loading = false
  }

  async load (...promiseFn) {
    this.queue.push(...promiseFn)
    this.emit(QUEUE_EVENT)
  }

  async proc () {
    if (this._loading) {
      return
    }
    this._loading = true
    while (this.queue.length) {
      const promiseFn = this.queue.dequeue()
      const startedAt = Date.now()
      promiseFn()
      const delay = this.time / this.rate
      const wait = Math.max(0, delay - (Date.now() - startedAt))
      // eslint-disable-next-line
      await new Promise(r => setTimeout(r, wait))
    }
    this._loading = false
  }
}

module.exports = {
  Limiter,
  RATES
}
