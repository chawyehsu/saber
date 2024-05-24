import { expect, it } from 'vitest'
import Markdown from '@alterjs/saber-markdown'
import fenceOptionsPlugin from '../highlight-plugin'
import createEnv from './create-env'

it('main', () => {
  const md = new Markdown()
  const { env } = createEnv()
  md.use(fenceOptionsPlugin)
  const html = md.render(
    `
\`\`\`vue
<div>hehe</div>
\`\`\`
  `,
    env,
  )
  expect(html).toMatchSnapshot()
})

it('code block with {lineNumbers:true}', () => {
  const md = new Markdown()
  const { env } = createEnv()
  md.use(fenceOptionsPlugin)
  const html = md.render(
    `
\`\`\`js {lineNumbers:true}
const cry = Array(3).fill('ora').join(' ')
\`\`\`
  `,
    env,
  )
  expect(html).toMatchSnapshot()
})

it('code block with {lineNumbers:true,lineStart:5}', () => {
  const md = new Markdown()
  const { env } = createEnv()
  md.use(fenceOptionsPlugin)
  const html = md.render(
    `
\`\`\`js {lineNumbers:true,lineStart:5}
const cry = Array(3).fill('ora').join(' ')
\`\`\`
  `,
    env,
  )
  expect(html).toMatchSnapshot()
})

it('code block markdown.lineNumbers = true', () => {
  const md = new Markdown()
  const { env } = createEnv()
  md.use(fenceOptionsPlugin, { lineNumbers: true })
  const html = md.render(
    `
\`\`\`js {lineNumbers:true}
const cry = Array(3).fill('ora').join(' ')
\`\`\`
  `,
    env,
  )
  expect(html).toMatchSnapshot()
})
