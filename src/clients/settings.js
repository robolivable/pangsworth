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
