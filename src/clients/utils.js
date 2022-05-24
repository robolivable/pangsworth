const config = require('../config')

const stripArrayDuplicates = a => {
  const o = {}
  for (const v of a) {
    o[v] = true
  }
  return Object.keys(o)
}

const isObject = o => typeof o === 'object' && !Array.isArray(o) && o !== null
const isArrayOfObjects = a => Array.isArray(a) && isObject(a[0])

const batch = async (aIn, f, size = config.API_ID_FETCH_BATCH_SIZE) => {
  let aOut = []
  for (let i = 0; i < aIn.length; i = i + size) {
    const s = aIn.slice(i, i + size)
    const r = await f(s)
    if (!r || !r.length) {
      continue
    }
    aOut = aOut.concat(r)
  }
  return aOut
}

const rollDice = (max, min = 0) => Math.floor(Math.random() * (max - min) + min)

const prettyPrintSeconds = seconds => {
  const tHours = Math.floor(seconds / 3600) + ''
  const tMinutes = Math.floor(seconds % 3600 / 60) + ''
  const tSeconds = Math.floor(seconds % 3600 % 60) + ''
  return `${tHours.padStart(2, '0')}:${tMinutes.padStart(2, '0')}:${tSeconds.padStart(2, '0')}`
}

module.exports = {
  stripArrayDuplicates,
  isObject,
  isArrayOfObjects,
  batch,
  rollDice,
  prettyPrintSeconds
}
