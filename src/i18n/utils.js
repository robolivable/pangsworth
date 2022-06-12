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
