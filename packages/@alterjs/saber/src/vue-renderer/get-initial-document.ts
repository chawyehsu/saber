import { prefixSpace } from './utils'

export interface DocumentData {
  title: string
  htmlAttrs: string
  headAttrs: string
  bodyAttrs: string
  link: string
  style: string
  headScript: string
  bodyScript: string
  noscript: string
  meta: string
}

/**
 * Get the initial HTML sent from server-side
 * @param {any} documentData
 */
export function getInitialDocument(documentData: any): string {
  const {
    title,
    meta,
    link,
    style,
    headScript,
    bodyScript,
    noscript,
    bodyAttrs,
    headAttrs,
    htmlAttrs,
  } = documentData

  return `
    <html${prefixSpace(htmlAttrs)}>
      <head${prefixSpace(headAttrs)}>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        ${meta} ${title} ${link}
        ${style} ${headScript} ${noscript}
      </head>
      <body${prefixSpace(bodyAttrs)}>
        <div id="_saber"></div>
        ${bodyScript}
      </body>
    </html>
  `
}

export function getInitialDocumentData(context: any): DocumentData {
  if (!context.metaInfo) {
    return {
      title: '',
      htmlAttrs: '',
      headAttrs: '',
      bodyAttrs: '',
      link: '',
      style: '',
      headScript: '',
      bodyScript: `<script src="/_saber/js/client.js" defer></script>`,
      noscript: '',
      meta: '',
    }
  }

  const {
    title,
    htmlAttrs,
    headAttrs,
    bodyAttrs,
    link,
    style,
    script,
    noscript,
    meta,
  } = context.metaInfo.inject()

  return {
    title: title.text(),
    htmlAttrs: `data-saber-ssr${prefixSpace(htmlAttrs.text())}`,
    headAttrs: headAttrs.text(),
    bodyAttrs: bodyAttrs.text(),
    link: link.text(),
    style: `${context.renderStyles()}${style.text()}`,
    headScript: script.text(),
    bodyScript: `${script.text({ body: true })}${context.renderScripts()}`,
    noscript: noscript.text(),
    meta: meta.text(),
  }
}
