const config = require('../config')

const i18nUtils = require('../i18n/utils')

class Settings {
  constructor (defaults = {}) {
    this.props = Object.assign({}, config.DEFAULT_SETTINGS, defaults)
    this.localization = i18nUtils.getDefaultLocale()
  }

  get (key) { return this.props[key] }
  set (key, value) { this.props[key] = value }

  setLocalizationById (id) {
    this.localization = i18nUtils.getLocalizationById(id)
  }

  async fetch () {
    const result = await chrome.storage.sync.get([
      config.STORAGE_VALUE_KEYS.sync.userSettings
    ])
    const props = result[config.STORAGE_VALUE_KEYS.sync.userSettings]
    this.props = Object.assign({}, this.props, props || {})
    const localization = await i18nUtils.getLocalization()
    this.localization = localization || this.localization
  }

  async persist () {
    await chrome.storage.sync.set({
      [config.STORAGE_VALUE_KEYS.sync.userSettings]: this.props
    })
    await i18nUtils.setLocalization(this.localization)
  }
}

module.exports = {
  Settings
}
