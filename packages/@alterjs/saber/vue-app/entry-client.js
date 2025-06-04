import createApp from './create-app'

const { app, router } = createApp()

if (__DEV__) {
  require('./dev-client').init({ router })
}

router.onReady(() => {
  app.$mount('#_saber')
})
