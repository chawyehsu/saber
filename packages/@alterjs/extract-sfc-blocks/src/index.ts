import posthtml from 'posthtml'
import stringifyAttrs from 'stringify-attributes'
import type { Node } from 'posthtml'
import type { HTMLAttributes } from 'stringify-attributes'

export interface Extracted {
  html: string
  blocks: string[]
}

function stringifyNode(node: string | Node): string {
  if (typeof node === 'string') {
    return node
  }

  const content = node.content || []
  const attrs: HTMLAttributes = {}

  const nodeAttrs = node.attrs || {}
  Object.keys(nodeAttrs).forEach((key) => {
    const value = nodeAttrs[key]
    if (value) {
      attrs[key] = value
    } else {
      attrs[key] = ''
    }
  })

  return `<${node.tag}${stringifyAttrs(attrs)}>${content
    .map(n => stringifyNode(n))
    .join('')}</${node.tag}>`
}

export default function (input: string): Extracted {
  const blocks: string[] = []
  // @ts-expect-error Should be string in sync mode
  const { html }: { html: string } = posthtml<string, string>([
    tree =>
      tree.walk((node) => {
        // Vue SFC <script> and <style> blocks
        if (node.tag === 'script' || node.tag === 'style') {
          blocks.push(stringifyNode(node))
          // Remove the block from the tree
          return []
        }

        return node
      }),
  ]).process(input, { sync: true })

  return {
    html,
    blocks,
  }
}
