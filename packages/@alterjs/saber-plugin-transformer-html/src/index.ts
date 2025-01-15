import extractSFCBlocks from '@alterjs/extract-sfc-blocks'
import type { Saber } from '@alterjs/saber'

exports.name = 'transformer-html'

exports.apply = (api: Saber) => {
  api.transformers.add('html', {
    extensions: ['html'],
    transform(page) {
      const { body, frontmatter } = api.transformers.parseFrontmatter(
        page.content!,
      )
      const { html, blocks } = extractSFCBlocks(body)
      Object.assign(page, frontmatter)
      page.content = html
      // @ts-expect-error hoistedTags is not defined in Page
      page.internal.hoistedTags = blocks
    },
    getPageComponent(page) {
      return `<template>
        <layout-manager>
          ${page.content || ''}
        </layout-manager>
      </template>
      `
    },
  })
}
