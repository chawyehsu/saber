export default {
  name: 'ClientOnly',
  functional: true,
  render(h, { parent, children }) {
    if (parent._isMounted) {
      return children
    }

    parent.$once('hook:mounted', () => {
      parent.$forceUpdate()
    })
  },
}
