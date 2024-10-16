// https://github.com/sindresorhus/is-absolute-url
// MIT License

// Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
// Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
const ABSOLUTE_URL_REGEX = /^[a-z][a-z\d+\-.]*:/i

// Windows paths like `c:\`
const WINDOWS_PATH_REGEX = /^[a-z]:\\/i

export default function isAbsoluteUrl(url: string): boolean {
  if (typeof url !== 'string') {
    throw new TypeError(`Expected a \`string\`, got \`${typeof url}\``)
  }

  if (WINDOWS_PATH_REGEX.test(url)) {
    return false
  }

  return ABSOLUTE_URL_REGEX.test(url)
}
