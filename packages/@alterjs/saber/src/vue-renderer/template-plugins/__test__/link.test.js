import { expect, it } from 'vitest'
import posthtml from 'posthtml'
import plugin from '../link'

async function transform(source) {
  const res = await posthtml([plugin()])
    .process(source, {
      recognizeSelfClosing: true,
    })
  return res.html
}

it('basic', async () => {
  const html = await transform(`
  <a href="foo">foo</a>
  <a href="https://example.com">foo</a>
  <a href="mailto:i@example.com">foo</a>
  <saber-link to="/foo">foo</saber-link>
  <saber-link :to="foo">foo</saber-link>
  `)
  expect(html).toBe(`
  <saber-link to="foo">foo</saber-link>
  <saber-link to="https://example.com">foo</saber-link>
  <saber-link to="mailto:i@example.com">foo</saber-link>
  <saber-link to="/foo">foo</saber-link>
  <saber-link :to="foo">foo</saber-link>
  `)
})

it('ignore', async () => {
  const html = await transform(`<a href="foo" saber-ignore>foo</a>`)
  expect(html).toBe(`<a href="foo">foo</a>`)
})
