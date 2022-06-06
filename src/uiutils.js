const utils = require('./utils')

const ROOT_MAX_HEIGHT_PX = 600
const ROOT_MAX_WIDTH_PX = 740

const ROOT_TOP_PADDING_PX = 48
const ROOT_LEFT_BAR_COLLAPSED_HORRIZONTAL_PX = 57
const ROOT_LEFT_BAR_EXPANDED_HORRIZONTAL_PX = 200

const THEME_GREEN = 'rgba(0 170 0 / 100%)'
const THEME_BLUE = 'rgba(34 113 177 / 100%)'
const THEME_RED = 'rgba(210 0 0 / 100%)'
const THEME_BROWN = 'rgba(128 64 0 / 100%)'
const THEME_VIOLET = 'rgba(139 46 127 / 100%)'
const THEME_DARK_RED = 'rgba(183 9 9 / 100%)'
const THEME_DARK_BROWN = 'rgba(96 7 7 / 100%)'
const THEME_YELLOW = 'rgba(203 201 58 / 100%)'
const THEME_LIGHT_BLUE = 'rgba(58 203 179 / 100%)'
const THEME_LIGHT_BROWN = 'rgba(197 151 78 / 100%)'

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
      if (name === 'id') {
        return value
      }
      return utils.camelToTextCase(value)
  }
}

module.exports = {
  ROOT_MAX_HEIGHT_PX,
  ROOT_MAX_WIDTH_PX,
  ROOT_TOP_PADDING_PX,
  ROOT_LEFT_BAR_COLLAPSED_HORRIZONTAL_PX,
  ROOT_LEFT_BAR_EXPANDED_HORRIZONTAL_PX,
  THEME_GREEN,
  THEME_BLUE,
  THEME_RED,
  THEME_BROWN,
  THEME_VIOLET,
  THEME_DARK_RED,
  THEME_DARK_BROWN,
  THEME_YELLOW,
  THEME_LIGHT_BLUE,
  THEME_LIGHT_BROWN,
  getThemeForRarity,
  textFromPrimitive
}
