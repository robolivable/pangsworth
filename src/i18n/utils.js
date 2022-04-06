const config = require('./config')

const getLocalization = async () => {
  const result = await chrome.storage.sync.get([config.STORAGE_KEY])
  return config.LANGUAGES[result.key]
}

const setLocalization = async l10n => {
  await chrome.storage.sync.set({ [config.STORAGE_KEY]: l10n.id })
}

module.exports = {
  getLocalization,
  setLocalization
}
