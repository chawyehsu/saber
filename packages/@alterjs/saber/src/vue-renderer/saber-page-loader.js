const qs = require('querystring')

/**
 * A webpack loader to handle Saber page components.
 * @typedef {import("@types/loader-runner").ExtendedLoaderContext} ExtendedLoaderContext
 *
 * @param {string} source
 * @returns {string}
 */
module.exports = function (source) {
  /** @type {ExtendedLoaderContext} */
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const loaderContext = this

  const pageId =
    loaderContext.resourceQuery &&
    qs.parse(loaderContext.resourceQuery.slice(1)).saberPage

  if (!pageId) return source

  const { getPageById, getTransformerByContentType, resolveCache } = loaderContext.query
  const page = Object.assign({}, getPageById(pageId))

  loaderContext.addDependency(resolveCache(`pages/${pageId}.saberpage`))

  const transformer = getTransformerByContentType(page.contentType)

  return `
  ${transformer.getPageComponent(page)}

  <page-prop>${pageId}</page-prop>

  ${page.internal.hoistedTags ? page.internal.hoistedTags.join('\n') : ''}
  `
}
