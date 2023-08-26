/**
 * @param {string} relative - The relative path of a file
 */
export default (relative: string) => {
  if (relative.startsWith('_posts/')) {
    return 'post'
  }

  return 'page'
}
