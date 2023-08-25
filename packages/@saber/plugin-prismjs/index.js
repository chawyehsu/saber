import loadLanguages from './loadLanguages'
import Prism from 'prismjs'

const languageAlias = {
  vue: 'html',
  sh: 'bash',
  styl: 'stylus'
}

function highlighter(code, lang) {
  if (!lang) return Prism.highlight(code, {})

  lang = lang.toLowerCase()

  if (lang in languageAlias) {
    lang = languageAlias[lang]
  }

  if (!Prism.languages[lang]) {
    try {
      loadLanguages(lang)
    } catch (error) {
      return Prism.highlight(code, {})
    }
  }

  const grammer = Prism.languages[lang]

  return Prism.highlight(code, grammer, lang)
}

const prismjsPlugin = {
  name: 'prismjs',
  apply(api) {
    api.hooks.chainMarkdown.tap(ID, config => {
      config.options.highlight(highlighter)
    })
  }
}

export default prismjsPlugin
