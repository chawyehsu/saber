import 'nprogress/nprogress.css'
import 'grid.css/grid.css'
import '@alterjs/saber-plugin-prismjs/default.css'
import './css/global.css'
import './css/button.css'
import './css/prism.css'
import './css/page.css'

export default ({ router, setHead }) => {
  if (typeof window !== "undefined") {
    const nprogress = require('nprogress')

    const loaded = Object.create(null)

    nprogress.configure({ showSpinner: false })

    router.beforeEach((to, from, next) => {
      if (!loaded[to.path]) {
        nprogress.start()
      }
      next()
    })

    router.afterEach(to => {
      loaded[to.path] = true
      nprogress.done()

      document.body.classList.remove('show-sidebar')
    })
  }

  setHead(vm => ({
    meta: [
      {
        name: 'description',
        hid: 'description',
        content: vm.$siteConfig.description
      }
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/png',
        href: '/img/icons/icon_128x128.png'
      }
    ]
  }))
}
