import type { SaberPlugin } from '..'
import type { Transformer } from '../Transformers'
import type { Page } from '../Pages'

function getPageComponent(page: Page) {
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
  apply: (api) => {
    api.transformers.add('default', {
      getPageComponent,
    } as Transformer)
  },
}

export default transformerDefaultPlugin
