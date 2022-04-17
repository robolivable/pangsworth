const EventEmitter = require('events')
const JSQueue = require('./js-queue')

const RATES = { millisecond: 1, second: 1000 }

class Limiter extends EventEmitter {
  constructor (rate, time, ...args) {
    super(...args)
    this.rate = rate
    this.time = time
    this.queue = new JSQueue()
    this.on('enqueue', this.proc)
    this._loading = false
  }

  async load (promiseFn) {
    this.queue.enqueue(promiseFn)
    this.emit('enqueue')
  }

  async proc () {
    if (this._loading) {
      return
    }
    this._loading = true
    while (this.queue.length) {
      const promiseFns = this.queue.dequeueN(this.rate)
      const promises = []
      for (const promiseFn of promiseFns) {
        promises.push(promiseFn())
      }
      await Promise.all(promises)
      // eslint-disable-next-line
      await new Promise(r => setTimeout(r, this.time))
    }
    this._loading = false
  }
}

module.exports = {
  Limiter,
  RATES
}
