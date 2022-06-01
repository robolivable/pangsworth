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
import 'core-js/stable'
import 'regenerator-runtime/runtime'

const { getGameObjectsByTypeName } = require('./clients/game-objects')
const { Limiter, RATES, Events } = require('./clients/limiter')
const config = require('./config')
const utils = require('./utils')

const getRetryBackoffMS = retry =>
  ((config.BG_IMG_PRELOAD.backoffExp * retry) ** 2) *
    utils.rollDice(config.BG_IMG_PRELOAD.backoffVarianceSec) *
      config.BG_IMG_PRELOAD.backoffMs

const preloadRetry = async (limiter, src, force = false, retries = 0) => {
  if (retries > config.BG_IMG_PRELOAD.maxRetry) {
    return
  }
  if (retries > 0) {
    // eslint-disable-next-line
    await new Promise(r => setTimeout(r, getRetryBackoffMS(retries)))
  }
  const c = await caches.open(config.CACHE_NAME_IMAGES)
  const match = await c.match(src)
  if (!!match) {
    if (!force) {
      return
    }
    const isStale = (
      Date.now() - (new Date(match.headers.get('date'))).getTime()
    ) > config.BG_IMG_PRELOAD.staleCacheAgeMs
    if (!isStale) {
      return
    }
  }
  limiter.load(async () => {
    try {
      await c.add(src)
    } catch (error) {
      if (error.name !== 'TypeError') {
        throw error
      }
      await preloadRetry(limiter, src, force, retries + 1)
    }
  })
}

const preloadCollection = async (collection, limiter, force = false) => {
  try {
    for (const object of collection.iter()) {
      for (const src of object.images()) {
        preloadRetry(limiter, src, force)
      }
    }
  } catch (error) {
    console.error('error loading collection', { error, collection })
  }
}

const notifyProgress = async limiter => {
  try {
    await chrome.runtime.sendMessage({
      type: config.MESSAGE_VALUE_KEYS.preloadImagesProgress,
      limiter: limiter.toJSON()
    })
  } catch (_) { /* NOOP */ }
}

const preloadImages = async (forceFetch, limiter) => {
  const hydratableResourceNames = Object.values(config.API_RESOURCE_TYPES)
    .filter(o => o.hydrate).map(o => o.name)
  const collectionFetches = []
  for (const name of hydratableResourceNames) {
    const [, GameObjectCollection] = getGameObjectsByTypeName(name)
    const c = new GameObjectCollection()
    collectionFetches.push(c.fetch())
  }
  const fetched = await Promise.all(collectionFetches)
  for (const collection of fetched) {
    await preloadCollection(collection, limiter, forceFetch)
  }
}

let preloadImageLock = false
let preloadImageRequestLock = false
const messageHandler = (request, _, respond) => {
  if (request.type !== config.MESSAGE_VALUE_KEYS.preloadImages) {
    respond()
    return
  }
  // NOTE: we can't block the call to respond()
  ;(async () => {
    if (preloadImageRequestLock) {
      console.warn('service worker is preloading images')
      throw new Error('noop')
    }
    preloadImageRequestLock = true
  })().then(async () => {
    if (preloadImageLock) {
      console.warn('service worker is preloading images')
      throw new Error('noop')
    }
    const limiter = new Limiter(
      config.API_REQUEST_RATE_SEC,
      RATES.second,
      notifyProgress
    )
    limiter.on(Events.LOADING_STARTED, async count => {
      preloadImageLock = true
    })
    limiter.on(Events.LOADING_DONE, async count => {
      if (!limiter.done) {
        return
      }
      if (count) { // NOTE: only notify on actual downloads
        await chrome.runtime.sendMessage({
          type: config.MESSAGE_VALUE_KEYS.preloadImagesCompleted,
          limiter
        })
      }
      preloadImageLock = false
    })
    await preloadImages(request.forceFetch, limiter)
    preloadImageRequestLock = false
  }).catch(error => {
    if (error.message !== 'noop') {
      console.error(error)
    }
  })
  respond() // NOTE: this is to suppress console errors (chromium bug #1304272)
}

let heartbeat = false
const keepAlive = async ({ type }, _, respond) => {
  if (type !== config.MESSAGE_VALUE_KEYS.heartbeat) {
    respond()
    return
  }
  heartbeat = !heartbeat
  respond()
}

chrome.runtime.onMessage.addListener(messageHandler)
chrome.runtime.onMessage.addListener(keepAlive)

const cacheRetry = async (src, retries = 0) => {
  const c = await caches.open(config.CACHE_NAME_IMAGES)
  const response = await c.match(src)
  if (response) {
    return response
  }
  if (retries > config.BG_IMG_PRELOAD.maxRetry) {
    throw new Error('max retries reached caching asset ' + src)
  }
  if (retries > 0) {
    // eslint-disable-next-line
    await new Promise(r => setTimeout(r, getRetryBackoffMS(retries)))
  }
  try {
    await c.add(src)
  } catch (error) {
    if (error.name !== 'TypeError') {
      throw error
    }
  }
  return cacheRetry(src, retries + 1)
}

const cacheRequest = async url => {
  let response
  try {
    response = await cacheRetry(url)
  } catch (error) {
    console.error(error)
    response = await fetch(url)
  }
  return response
}

const imageFetchListener = e => {
  if (!e.request.url.includes('/image/')) {
    return
  }
  e.respondWith(cacheRequest(e.request.url))
}

self.addEventListener('fetch', imageFetchListener)
