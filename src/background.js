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

const config = require('./clients/config')

let downloadCancel = false
const downloadAllImageAssets = async () => {
  downloadCancel = false
  console.log({ downloadCancel })
  // TODO: full image asset download
}

const downloadAllImageAssetsCancel = () => { downloadCancel = true }

const messageHandler = async (request, sender, respond) => {
  switch (request.type) {
    case config.MESSAGE_VALUE_KEYS.downloadAllImageAssets:
      await downloadAllImageAssets()
      break
    case config.MESSAGE_VALUE_KEYS.downloadAllImageAssetsCancel:
      downloadAllImageAssetsCancel()
      break
    default:
      console.warn('unhandled message type', { request, sender })
  }
  respond() // NOTE: this is to suppress console errors (chromium bug #1304272)
}

chrome.runtime.onMessage.addListener(messageHandler)
