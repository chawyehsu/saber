import type { BundleRenderer } from 'vue-server-renderer'
import type { hooks as SaberHooks } from '../hooks'
import { getInitialDocument, getInitialDocumentData } from './get-initial-document'

export interface RenderContext {
  url?: string
  markup?: string
}

export default async (
  renderer: BundleRenderer,
  { url, hooks, isProd }: { url: string, hooks: typeof SaberHooks, isProd: boolean },
) => {
  const context: RenderContext = { url }
  context.markup = await renderer.renderToString(context)

  // Get document data that is used to document string
  const documentData = hooks.getDocumentData.call(
    getInitialDocumentData(context),
    context,
  )

  // Get document string
  let document = hooks.getDocument.call(
    getInitialDocument(documentData),
    context,
  )

  if (isProd) {
    // Remove whitespaces
    document = document.replace(/^\s+/gm, '').replace(/\n+</g, '<')
  }

  return {
    html: `<!DOCTYPE html>${document}`.replace(
      '<div id="_saber"></div>',
      context.markup,
    ),
    context,
  }
}
