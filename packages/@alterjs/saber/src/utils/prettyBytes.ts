const UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

/*
Formats the given number using `Number#toLocaleString`.
- If locale is a string, the value is expected to be a locale-key (for example: `de`).
- If locale is true, the system default locale is used for translation.
- If no value for locale is specified, the number is returned unmodified.
*/
function toLocaleString(number: number, locale?: string | boolean) {
  if (typeof locale === 'string') {
    return number.toLocaleString(locale)
  } else if (locale === true) {
    return number.toLocaleString()
  }

  return number.toString()
}

export default (number: number, options?: any) => {
  if (!Number.isFinite(number)) {
    throw new TypeError(
      `Expected a finite number, got ${typeof number}: ${number}`,
    )
  }

  options = Object.assign({}, options)

  if (options.signed && number === 0) {
    return ' 0 B'
  }

  const isNegative = number < 0
  const prefix = isNegative ? '-' : options.signed ? '+' : ''

  if (isNegative) {
    number = -number
  }

  if (number < 1) {
    const numberString = toLocaleString(number, options.locale)
    return `${prefix + numberString} B`
  }

  const exponent = Math.min(
    Math.floor(Math.log10(number) / 3),
    UNITS.length - 1,
  )
  number = Number((number / 1000 ** exponent).toPrecision(3))
  const numberString = toLocaleString(number, options.locale)

  const unit = UNITS[exponent]

  return `${prefix + numberString} ${unit}`
}
