export default (url) => {
  if (typeof url !== 'string') {
    throw new TypeError(`Expected a \`string\`, got \`${typeof url}\``)
  }

  // Don't match Windows paths `c:\`
  if (/^[a-z]:\\/i.test(url)) {
    return false
  }

  // Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
  // Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
  return /^[a-z][a-z\d+\-.]*:/i.test(url)
}
