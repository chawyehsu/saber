import { slash } from 'saber-utils'
import { parseComponent } from 'vue-template-compiler'
import { SaberPlugin } from '..'
import { Page } from '../Pages'
import parseAttributes from '../utils/parseAttributes'

const getPageComponent = (page: Page) => {
  return `<script>
  import PageComponent from "${slash(page.internal.absolute!)}"

  export default {
    render(h) {
      return h('layout-manager', {
        scopedSlots: {
          component(props) {
            return h(PageComponent, { props })
          }
        }
      })
    }
  }
  </script>
  `
}

/**
 * This plugin is used to transform `.vue` Vue SFC and `.js` files to pages.
 * docs: http://127.0.0.1:3000/docs/pages.html
 */
const transformerComponentsPlugin: SaberPlugin = {
  name: 'builtin:transformer-components',
  apply: api => {
    // Vue SFC transformer
    api.transformers.add('vue', {
      extensions: ['vue'],
      transform(page) {
        const sfc = parseComponent(page.content!)
        if (sfc.script) {
          const attributes = parseAttributes(
            sfc.script.content,
            page.internal.absolute!
          )
          Object.assign(page, attributes)
        }
      },
      getPageComponent
    })

    // .js transformer
    api.transformers.add('js', {
      extensions: ['js'],
      transform(page) {
        const attributes = parseAttributes(
          page.content!,
          page.internal.absolute!
        )
        Object.assign(page, attributes)
      },
      getPageComponent
    })
  }
}

export default transformerComponentsPlugin
