const config = require('./config')

const getLocalization = async () => {
  const result = await chrome.storage.sync.get([config.STORAGE_KEY])
  const l10nId = result[config.STORAGE_KEY]
  return config.LANGUAGES[l10nId]
}

const setLocalization = async l10n => {
  await chrome.storage.sync.set({ [config.STORAGE_KEY]: l10n.id })
}

const getLocalizationById = id => config.LANGUAGES[id]
const getDefaultLocale = () => config.defaultLocale
const isLocalizableProp = prop => config.LOCALIZABLE_PROPS[prop]

module.exports = {
  getLocalization,
  setLocalization,
  getLocalizationById,
  getDefaultLocale,
  isLocalizableProp
}
