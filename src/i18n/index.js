const TranslationsObject = require('./translations.json')

const localize = (context, key, prop) => {
  if (!TranslationsObject[key]) {
    return ''
  }
  const translation = TranslationsObject[key][prop]
  const value = translation[context?.settings?.localization?.id]
  return value || ''
}

module.exports = {
  localize
}
