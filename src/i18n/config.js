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

const LOCALIZABLE_PROPS = {
  name: true,
  title: true,
  description: true,
  dialogsBegin: true,
  dialogsAccept: true,
  dialogsDecline: true,
  dialogsComplete: true,
  dialogsFail: true
}

const LANGUAGES = {
  en: {
    id: 'en',
    name: 'English',
    flag: 'en.png'
  },
  fr: {
    id: 'fr',
    name: 'Français',
    flag: 'fr.png'
  },
  kr: {
    id: 'kr',
    name: '한국어',
    flag: 'kr.png'
  },
  ar: {
    id: 'ar',
    name: 'اَلْعَرَبِيَّةُ',
    flag: 'ar.png'
  },
  br: {
    id: 'br',
    name: 'Português',
    flag: 'br.png',
    lunrKey: 'lunr.pt'
  },
  cns: {
    id: 'cns',
    name: '简化字',
    flag: 'cns.png'
  },
  de: {
    id: 'de',
    name: 'Deutsch',
    flag: 'de.png'
  },
  fi: {
    id: 'fi',
    name: 'Suomi',
    flag: 'fi.png'
  },
  fil: {
    id: 'fil',
    name: 'Filipino',
    flag: 'fil.png'
  },
  it: {
    id: 'it',
    name: 'Italiano',
    flag: 'it.png'
  },
  nl: {
    id: 'nl',
    name: 'Nederlands',
    flag: 'nl.png'
  },
  pl: {
    id: 'pl',
    name: 'Polski',
    flag: 'pl.png'
  },
  ru: {
    id: 'ru',
    name: 'Ру́сский',
    flag: 'ru.png'
  },
  sw: {
    id: 'sw',
    name: 'Svenska',
    flag: 'sw.png'
  },
  th: {
    id: 'th',
    name: 'ไทย',
    flag: 'th.png'
  }
}

module.exports = {
  defaultLocale: LANGUAGES.en,
  LOCALIZABLE_PROPS,
  LANGUAGES,
  languages: LANGUAGES,
  STORAGE_KEY: 'pangsworthI18n'
}
