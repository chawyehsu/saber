/**
 * Determine file names of the output assets (js, css, font, image...)
 *
 * @param {boolean} useHash - Whether to use hash in file names
 */
export default function getFileNames(useHash: boolean) {
  return {
    js: useHash ? 'js/[name].[chunkhash:8].js' : 'js/[name].js',
    css: useHash ? 'css/[name].[chunkhash:8].css' : 'css/[name].css',
    font: useHash ? 'fonts/[name].[hash:8].[ext]' : 'fonts/[path][name].[ext]',
    image: useHash
      ? 'images/[name].[hash:8].[ext]'
      : 'images/[path][name].[ext]',
  }
}
