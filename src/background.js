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
const { Limiter, RATES } = require('./clients/limiter')
const config = require('./clients/config')
const utils = require('./clients/utils')

const getRetryBackoffMS = retry =>
  ((config.BG_IMG_PRELOAD.backoffExp * retry) ** 2) *
    utils.rollDice(config.BG_IMG_PRELOAD.backoffVarianceSec) *
      config.BG_IMG_PRELOAD.backoffMs

const preloadRetry = async (limiter, src, retries = 0) => {
  if (retries > config.BG_IMG_PRELOAD.maxRetry) {
    return
  }
  if (retries > 0) {
    // eslint-disable-next-line
    await new Promise(r => setTimeout(r, getRetryBackoffMS(retries)))
  }
  const c = await caches.open(config.CACHE_NAME_IMAGES)
  const skip = !!(await c.match(src))
  if (skip) {
    return
  }
  limiter.load(async () => {
    try {
      await c.add(src)
    } catch (error) {
      if (error.name !== 'TypeError') {
        throw error
      }
      await preloadRetry(limiter, src, retries + 1)
    }
  })
}

const preloadCollection = async (collection, limiter) => {
  try {
    for (const object of collection.iter()) {
      for (const src of object.images()) {
        preloadRetry(limiter, src)
      }
    }
  } catch (error) {
    console.error('error loading collection', { error, collection })
  }
}

const progressNotifier = async limiter => {
  while (!limiter.started) {
    // eslint-disable-next-line
    await new Promise(r => setTimeout(r, config.BG_IMG_PRELOAD.progressTickMs))
  }
  while (!limiter.done) {
    await chrome.runtime.sendMessage({
      type: config.MESSAGE_VALUE_KEYS.preloadImagesProgress,
      limiter: limiter.toJSON()
    })
    // eslint-disable-next-line
    await new Promise(r => setTimeout(r, config.BG_IMG_PRELOAD.progressTickMs))
  }
  await chrome.runtime.sendMessage({
    type: config.MESSAGE_VALUE_KEYS.preloadImagesProgress,
    limiter: limiter.toJSON()
  })
}

const preloadImages = async () => {
  const hydratableResourceNames = Object.values(config.API_RESOURCE_TYPES)
    .filter(o => o.hydrate).map(o => o.name)
  const collectionFetches = []
  for (const name of hydratableResourceNames) {
    const [, GameObjectCollection] = getGameObjectsByTypeName(name)
    const c = new GameObjectCollection()
    collectionFetches.push(c.fetch())
  }
  const fetched = await Promise.all(collectionFetches)
  const limiter = new Limiter(config.API_REQUEST_RATE_SEC, RATES.second)
  progressNotifier(limiter)
  for (const collection of fetched) {
    await preloadCollection(collection, limiter)
  }
}

let preloadImageLock = false
const messageHandler = async (request, sender, respond) => {
  switch (request.type) {
    case config.MESSAGE_VALUE_KEYS.preloadImages:
      if (preloadImageLock) {
        console.warn('ignoring redundant request to preload images')
        break
      }
      preloadImageLock = true
      preloadImages().then(() => { preloadImageLock = false })
      break
  }
  respond() // NOTE: this is to suppress console errors (chromium bug #1304272)
}

chrome.runtime.onMessage.addListener(messageHandler)
