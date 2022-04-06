const TranslationsObject = require('./translations.json')
const config = require('./config')

const valueForContext = (context, translation) => {
  const { language } = context
  return translation[config.languages[language].id]
}

const localize = (context, key, prop) => {
  if (!TranslationsObject[key]) {
    return ''
  }
  const translation = TranslationsObject[key][prop]
  return valueForContext(context, translation)
}

module.exports = {
  valueForContext,
  localize
}
