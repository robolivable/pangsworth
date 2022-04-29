const EventEmitter = require('events')
const JSQueue = require('./js-queue')
const utils = require('./utils')
const config = require('./config')

const RATES = { millisecond: 1, second: 1000 }
const EVENT_QUEUE = 'enqueue'
const EVENT_LOADING_STARTED = 'loadingStarted'
const EVENT_LOADING_DONE = 'loadingDone'

class Limiter extends EventEmitter {
  constructor (rate, timeMs, notifier, ...args) {
    super(...args)
    this.rate = rate
    this.timeMs = timeMs
    this.queue = new JSQueue()
    this.on(EVENT_QUEUE, this.proc)
    this.metric = 0
    this.started = false
    this._loading = false
    this.notifier = notifier
    this._notifierFiredLastAt = 0
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
    this.emit(EVENT_QUEUE)
  }

  _fireNotifier () {
    const notifierDelayDelta = Date.now() - this._notifierFiredLastAt
    if (notifierDelayDelta < config.UI_LIMITS.notificationDelayMs) {
      return
    }
    this.notifier(this)
    this._notifierFiredLastAt = Date.now()
  }

  async proc () {
    if (this._loading) {
      return
    }
    this._fireNotifier()
    this.started = true
    this._loading = true
    this.emit(EVENT_LOADING_STARTED, this.metric)
    while (this.queue.length) {
      const promiseFn = this.queue.dequeue()
      const startedAt = Date.now()
      promiseFn()
      const delay = this.timeMs / this.rate
      const wait = Math.max(0, delay - (Date.now() - startedAt))
      // eslint-disable-next-line
      await new Promise(r => setTimeout(r, wait))
      this._fireNotifier()
    }
    this._loading = false
    this.emit(EVENT_LOADING_DONE, this.metric)
    this._fireNotifier()
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
  RATES,
  Events: {
    LOADING_STARTED: EVENT_LOADING_STARTED,
    LOADING_DONE: EVENT_LOADING_DONE
  }
}
