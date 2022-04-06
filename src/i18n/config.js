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
