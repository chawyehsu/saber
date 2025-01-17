import Prism from 'prismjs'
import type { Saber } from '@alterjs/saber'
import { loadPrismLanguage } from './loadLanguages'

const languageAlias = {
  vue: 'html',
  sh: 'bash',
  styl: 'stylus',
}

function highlighter(code: string, lang: string) {
  if (!lang) {
    return Prism.highlight(code, {}, '')
  }

  lang = lang.toLowerCase()

  if (lang in Object.keys(languageAlias)) {
    lang = languageAlias[lang as keyof typeof languageAlias]
  }

  if (!Prism.languages[lang]) {
    try {
      loadPrismLanguage(lang)
    } catch (error) {
      return Prism.highlight(code, {}, '')
    }
  }

  const grammer = Prism.languages[lang]

  return Prism.highlight(code, grammer, lang)
}

const ID = 'prismjs'

const prismjsPlugin = {
  name: ID,
  apply(api: Saber) {
    api.hooks.chainMarkdown.tap(ID, (config) => {
      config.options.highlight(highlighter)
    })
  },
}

module.exports = prismjsPlugin
