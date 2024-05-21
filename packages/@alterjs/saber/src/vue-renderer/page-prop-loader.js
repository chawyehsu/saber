const devalue = require('devalue')
const { requireAssets } = require('../utils/assetsAttribute')

/**
 * A webpack loader to handle `<page-prop>` custom block
 * @typedef {import("@types/loader-runner").ExtendedLoaderContext} ExtendedLoaderContext
 *
 * @param {string} source
 * @param {object} [map]
 */
module.exports = function(source, map) {
  /** @type {ExtendedLoaderContext} */
  const loaderContext = this

  const pageId = source.trim()
  const { getPagePublicFields } = loaderContext.query
  const page = requireAssets(devalue(getPagePublicFields(pageId)))
  const result = `
  export default function(Component) {
    var page = ${page}
    var beforeCreate = Component.options.beforeCreate || []
    Component.options.beforeCreate = [function() {
      this.$page = page
    }].concat(beforeCreate)

    // These options can be defined as Vue component option or page attribute
    // They are also available in layout component except for the 'layout' option
    var pageComponentOptions = ['layout', 'transition']

    pageComponentOptions.forEach(function(name) {
      var PageComponent = Component.options.PageComponent
      if (PageComponent) {
        // .vue or .js page, set route transition from PageComponent
        Component.options[name] = PageComponent[name]
      }

      // Fallback to page attribute
      if (Component.options[name] === undefined) {
        Component.options[name] = page[name]
      }
    })

    // page.slug is optional
    if (page.slug) {
      Component.options.name = 'page-wrapper-' + page.slug.replace(/[^0-9a-z\\-]/ig, '-')
    }
    if (module.hot) {
      var Vue = require('vue').default
      Component.options._Ctor = Vue.extend(Component)
    }
  }
  `

  loaderContext.callback(null, result, map)
}
