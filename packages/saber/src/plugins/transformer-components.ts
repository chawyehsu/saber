import { slash } from 'saber-utils'
import { SaberPlugin } from '..'
import { Page } from '../Pages'

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

const transformerComponentsPlugin: SaberPlugin = {
  name: 'builtin:transformer-components',
  apply: api => {
    api.transformers.add('vue', {
      extensions: ['vue'],
      transform(page) {
        const sfc = require('vue-template-compiler').parseComponent(page.content)
        if (sfc.script) {
          const { data } = require('../utils/parseAttributes')(
            sfc.script.content,
            page.internal.absolute
          )
          Object.assign(page, data)
        }
      },
      getPageComponent
    })

    api.transformers.add('js', {
      extensions: ['js'],
      transform(page) {
        const { data } = require('../utils/parseAttributes')(
          page.content,
          page.internal.absolute
        )
        Object.assign(page, data)
      },
      getPageComponent
    })
  }
}

export default transformerComponentsPlugin
