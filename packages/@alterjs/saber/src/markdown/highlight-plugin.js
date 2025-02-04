const CODE_OPTIONS_RE = /\s*\{([^}]+)\}/

function parseOptions(str) {
  if (!CODE_OPTIONS_RE.test(str)) {
    return {}
  }

  const [, options] = CODE_OPTIONS_RE.exec(str)
  const fn = new Function(`return {${options}}`) // eslint-disable-line no-new-func
  return fn()
}

function generateLineNumbers(code, lineStart) {
  return `<span aria-hidden="true" class="saber-highlight-line-numbers" style="counter-reset: linenumber ${lineStart}">${
  code
    .trim()
    .split('\n')
    .map(() => `<span></span>`)
    .join('')
  }</span>`
}

module.exports = (
  md,
  { highlightedLineBackground, lineNumbers = false } = {},
) => {
  const renderPreWrapper = ({
    preWrapperAttrs,
    preAttrs,
    codeAttrs,
    code,
    codeMask = '',
    lines = '',
  }) =>
    `<div${preWrapperAttrs}>${codeMask}<pre${preAttrs}><code${codeAttrs}>${lines}${code.trim()}</code></pre></div>`

  md.renderer.rules.fence = (...args) => {
    const [tokens, idx, options, env, self] = args
    const token = tokens[idx]

    const fenceOptions = parseOptions(token.info)
    const langName = token.info.replace(CODE_OPTIONS_RE, '').trim()
    const langClass = `language-${langName || 'text'}`
    token.info = langName

    const code = options.highlight
      ? options.highlight(token.content, langName, env)
      : md.utils.escapeHtml(token.content)

    const highlightLines = fenceOptions.highlightLines
      ? fenceOptions.highlightLines.map(v =>
          `${v}`.split('-').map(v => Number.parseInt(v, 10)),
      )
      : []

    const codeMask
      = highlightLines.length === 0
        ? ''
        : `<div class="saber-highlight-mask${
            langClass ? ` ${langClass}` : ''
          }">${
          md.utils
            .escapeHtml(token.content)
            .split('\n')
            .map((split, index) => {
              split = split || '&#8203;'
              const lineNumber = index + 1
              const inRange = highlightLines.some(([start, end]) => {
                if (start && end) {
                  return lineNumber >= start && lineNumber <= end
                }

                return lineNumber === start
              })
              if (inRange) {
                const style = highlightedLineBackground
                  ? ` style="background-color: ${highlightedLineBackground}"`
                  : ''
                return `<div class="code-line highlighted"${style}>${split}</div>`
              }

              return `<div class="code-line">${split}</div>`
            })
            .join('')
          }</div>`

    const renderAttrs = attrs => self.renderAttrs({ attrs })
    const shouldGenerateLineNumbers
      // It might be false so check for undefined
      = fenceOptions.lineNumbers === undefined
        // Defaults to global config
        ? lineNumbers
        // If it's set to false, even if the global config says true, ignore
        : fenceOptions.lineNumbers
    const lineStartNumber
      // It might be 0 so check for undefined
      = fenceOptions.lineStart === undefined
        // Default line should be 1
        ? 1
        : fenceOptions.lineStart
    const lines = shouldGenerateLineNumbers
      // Need to substract 1 because the counter will be incremented right away
      ? generateLineNumbers(code, lineStartNumber - 1)
      : ''

    const preAttrs = renderAttrs([
      ...(token.attrs || []),
      ['class', ['saber-highlight-code', langClass].filter(Boolean).join(' ')],
    ])
    const codeAttrs = renderAttrs([
      ...(token.attrs || []),
      ['class', langClass],
    ])
    const preWrapperAttrs = renderAttrs([
      [
        'class',
        `saber-highlight${shouldGenerateLineNumbers ? ' has-line-numbers' : ''}`,
      ],
      ['v-pre', ''],
      ['data-lang', langName],
    ])

    return renderPreWrapper({
      preWrapperAttrs,
      preAttrs,
      codeAttrs,
      code,
      codeMask,
      lines,
    })
  }
}
