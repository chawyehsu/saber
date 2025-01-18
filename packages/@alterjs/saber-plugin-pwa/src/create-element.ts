import stringify from 'stringify-attributes'
import type { HTMLAttributes } from 'stringify-attributes'

export default function (tagName: string, attrs: HTMLAttributes, content?: string) {
  const attrString = stringify(attrs)
  return content
    ? `<${tagName}${attrString}>${content}</${tagName}`
    : `<${tagName}${attrString} />`
}
