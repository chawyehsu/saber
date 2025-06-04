import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ClientOnly',
  functional: true,
  render(_, { parent, children }) {
    if (parent._isMounted) {
      return children
    }

    parent.$once('hook:mounted', () => {
      parent.$forceUpdate()
    })
  },
})
