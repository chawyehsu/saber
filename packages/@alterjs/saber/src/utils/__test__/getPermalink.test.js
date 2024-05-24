import { expect, it } from 'vitest'
import getPermalink from '../getPermalink'

it('use default permalink', () => {
  const samples = [
    { slug: 'index', permalink: '/' },
    { slug: 'foo/index', permalink: '/foo' },
    { slug: 'foo/bar', permalink: '/foo/bar.html' },
  ]
  for (const sample of samples) {
    const receivedPermalink = getPermalink(
      [],
      {
        slug: sample.slug,
        type: 'page',
        createdAt: new Date('2019-01-01'),
      },
      {},
    )
    expect(receivedPermalink).toBe(sample.permalink)
  }
})

it('remove .html extension', () => {
  const samples = [
    { slug: 'index', permalink: '/' },
    { slug: 'foo/index', permalink: '/foo' },
    { slug: 'foo/bar', permalink: '/foo/bar' },
  ]
  for (const sample of samples) {
    const receivedPermalink = getPermalink(
      [],
      {
        slug: sample.slug,
        type: 'page',
        createdAt: new Date('2019-01-01'),
      },
      {
        page: '/:slug',
      },
    )
    expect(receivedPermalink).toBe(sample.permalink)
  }
})
