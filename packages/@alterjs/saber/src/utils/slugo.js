/**
 * Convert a string to a slug.
 *
 * @param {string} input The string to convert
 * @returns {string} The slug
 */
module.exports = function slugo(input) {
  return (
    input
      // Remove html tags
      .replace(/<(?:.|\n)*?>/g, '')
      // Remove special characters
      .replace(/[!"#$%&'()*+,/:;<=>?@[\\\]^`{|}~]/g, '')
      // Replace dots and spaces with a short dash
      .replace(/(\s|\.)/g, '-')
      // Replace multiple dashes with a single dash
      .replace(/-{2,}/g, '-')
      // Replace long dash with two short dashes
      .replace(/—/g, '--')
      // Make the whole thing lowercase
      .toLowerCase()
  )
}
