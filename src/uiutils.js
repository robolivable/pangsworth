const utils = require('./utils')

const THEME_GREEN = 'rgba(0 170 0 / 100%)'
const THEME_BLUE = 'rgba(34 113 177 / 100%)'
const THEME_RED = 'rgba(210 0 0 / 100%)'
const THEME_BROWN = 'rgba(128 64 0 / 100%)'

const ITEM_RARITY_COLORS = {
  common: { display: 'Common', color: THEME_BLUE },
  rare: { display: 'Rare', color: THEME_GREEN },
  uncommon: { display: 'Uncommon', color: THEME_BROWN },
  unique: { display: 'Unique', color: THEME_RED },
  veryrare: { display: 'Very Rare', color: THEME_RED }
}

const getThemeForRarity = rarity => {
  if (!ITEM_RARITY_COLORS[rarity]) {
    return { display: '', color: '' }
  }
  return ITEM_RARITY_COLORS[rarity]
}

const textFromPrimitive = (value, name) => {
  switch (typeof value) {
    case 'boolean':
      return value ? 'Yes' : 'No'
    case 'number':
      if (name === '__id') {
        return value
      }
      return utils.intToLocalizedString(value) // TODO: localize
    default:
      return value
  }
}

module.exports = {
  THEME_GREEN,
  THEME_BLUE,
  THEME_RED,
  THEME_BROWN,
  getThemeForRarity,
  textFromPrimitive
}
