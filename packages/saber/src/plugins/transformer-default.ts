import { SaberPlugin } from '..'
import { Transformer } from '../Transformers'
import { Page } from '../Pages'

const getPageComponent = (page: Page) => {
  return `
  <template>
    <layout-manager>
      ${page.content || ''}
    </layout-manager>
  </template>
`
}

const transformerDefaultPlugin: SaberPlugin = {
  name: 'builtin:transformer-markdefault',
  apply: api => {
    api.transformers.add('default', {
      getPageComponent
    } as Transformer)
  }
}

export default transformerDefaultPlugin
