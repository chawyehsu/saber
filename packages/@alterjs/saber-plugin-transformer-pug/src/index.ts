import path from 'node:path'
import pug from 'pug'
import extractSFCBlocks from '@alterjs/extract-sfc-blocks'
import type { Saber } from '@alterjs/saber'

const ID = 'transformer-pug'

exports.name = ID

exports.apply = (api: Saber) => {
  api.transformers.add('pug', {
    extensions: ['pug'],
    transform(page) {
      const { body, frontmatter } = api.transformers.parseFrontmatter(
        page.content!,
      )
      const { base: basename, dir: dirname } = path.parse(
        page.internal.absolute || '',
      )
      const html = pug.render(body, {
        filename: basename,
        basedir: dirname,
      })
      // eslint-disable-next-line no-console
      console.log(html)
      const { html: pageContent, blocks } = extractSFCBlocks(html)
      Object.assign(page, frontmatter)
      page.content = pageContent
      // @ts-expect-error - hoistedTags is not defined in Page
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

  api.hooks.chainWebpack.tap(ID, (config) => {
    config.module
      .rule('pug')
      .test(/\.pug$/)
      .use('pug-loader')
      .loader(require.resolve('./pug-plain-loader'))
  })
}
