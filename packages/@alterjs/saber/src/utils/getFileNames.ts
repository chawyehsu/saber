/**
 * Determine file names of the output assets (js, css, font, image...)
 *
 * @param {boolean} useHash - Whether to use hash in file names
 */
export default function getFileNames(useHash: boolean) {
  return {
    // FIXME(chawyehsu):
    // Ideally we want all js files to be placed in the `js/` subdirectory,
    // but vue-server-renderer 2.x has a bug [1] with webpack 5 that it cannot
    // resolve the correct path of the component that is imported using `import()`.
    //
    // [1]: https://github.com/vuejs/vue/issues/12924
    js: useHash ? '[name].[chunkhash:8].js' : '[name].js',
    css: useHash ? 'css/[name].[chunkhash:8].css' : 'css/[name].css',
    font: useHash ? 'fonts/[name].[contenthash:8][ext]' : 'fonts/[name][ext]',
    image: useHash ? 'images/[name].[contenthash:8][ext]' : 'images/[name][ext]',
  }
}
