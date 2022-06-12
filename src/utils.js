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

const config = require('./config')

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

const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1)
const camelToTextCase = string => capitalize(
  string.replace(/([A-Z])/g, ' $1')
).replace(/([A-Z]) /g, '$1')

const intToLocalizedString = (value, i18n) => value.toLocaleString() // TODO: localize

const FACTOR = 20
const MAX_LEVEL = 120
const Game = {
  maxStatPointsForLevel: (level = MAX_LEVEL) => {
    let sp = 0 // TODO: derive closed form for improved perf
    for (let i = 0; i <= ((level - 1) / FACTOR); ++i) {
      for (
        let j = Math.max((i * FACTOR + 1) - 1, 1);
        j < Math.min(((i + 1) * FACTOR), level);
        ++j
      ) {
        sp = sp + i + 2
      }
    }
    return sp
  },
  levelForStatPoints: points => {
    for (let l = 1; l <= MAX_LEVEL; ++l) { // TODO: derive closed form
      if (Game.maxStatPointsForLevel(l) !== points) {
        continue
      }
      return l
    }
    return MAX_LEVEL
  }
}

module.exports = {
  stripArrayDuplicates,
  isObject,
  isArrayOfObjects,
  batch,
  rollDice,
  prettyPrintSeconds,
  capitalize,
  camelToTextCase,
  intToLocalizedString,
  Game
}
