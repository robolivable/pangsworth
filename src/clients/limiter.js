const EventEmitter = require('events')
const JSQueue = require('./js-queue')
const utils = require('./utils')

const RATES = { millisecond: 1, second: 1000 }
const QUEUE_EVENT = 'enqueue'

class Limiter extends EventEmitter {
  constructor (rate, timeMs, ...args) {
    super(...args)
    this.rate = rate
    this.timeMs = timeMs
    this.queue = new JSQueue()
    this.on(QUEUE_EVENT, this.proc)
    this.metric = 0
    this.started = false
    this._loading = false
  }

  get progress () {
    return 100 - Math.round(this.queue.length / this.metric * 100)
  }

  get timeRemaining () {
    const remainingSeconds =
      ((this.timeMs / this.rate) * this.queue.length) / RATES.second
    return utils.prettyPrintSeconds(remainingSeconds)
  }

  get done () {
    return this.started && !this._loading && this.queue.length === 0
  }

  reset () {
    this.queue = new JSQueue()
    this.metric = 0
    this.started = false
  }

  async load (...promiseFn) {
    this.metric += promiseFn.length
    this.queue.push(...promiseFn)
    this.emit(QUEUE_EVENT)
  }

  async proc () {
    if (this._loading) {
      return
    }
    this.started = true
    this._loading = true
    while (this.queue.length) {
      const promiseFn = this.queue.dequeue()
      const startedAt = Date.now()
      promiseFn()
      const delay = this.timeMs / this.rate
      const wait = Math.max(0, delay - (Date.now() - startedAt))
      // eslint-disable-next-line
      await new Promise(r => setTimeout(r, wait))
    }
    this._loading = false
  }

  toJSON () {
    return {
      progress: this.progress,
      timeRemaining: this.timeRemaining,
      done: this.done
    }
  }
}

module.exports = {
  Limiter,
  RATES
}
