import { log } from 'saber-log'
import tomlParser from './toml.min'
import yamlParser from './yaml.min'

const RE_STARTING = /^(?:\r?\n)*---([a-z]+)?(?:\r?\n)+/

type Parser = (str: string) => Object

const parsers: {
  [k: string]: Parser
} = {
  yaml: (str: string) => yamlParser.safeLoad(str),
  yml: (str: string) => yamlParser.safeLoad(str),
  toml: (str: string) => tomlParser.parse(str)
}

/**
 * Extract front matter from a page
 * @param {string} content The content of a page
 * @param {string} filepath The absolute path to the path
 * @returns {{frontmatter: {[k:string]: any}, body: string}}
 */
export default (content: string, filepath: string): {
  frontmatter: { [k: string]: any }; body: string
} => {
  const getEmpty = () => ({
    frontmatter: {},
    body: content && content.trim()
  })

  if (!content) {
    return getEmpty()
  }

  const starting = RE_STARTING.exec(content)
  if (!starting) {
    return getEmpty()
  }

  const parseType = starting[1] || 'yaml'
  const parse = parsers[parseType as keyof typeof parsers]
  if (!parse) {
    throw new Error(`Unsupported front matter type: ${parseType}`)
  }

  const rest = content.replace(RE_STARTING, '')
  const index = rest.indexOf('\n---')
  const head = rest.slice(0, index)
  const body = rest.slice(index + 4)
  let frontmatter
  try {
    frontmatter = parse(head)
  } catch (error) {
    if (filepath) {
      log.error(`Error parsing front matter in ${filepath}`)
    }

    throw error
  }

  return {
    frontmatter,
    body: body && body.trim()
  }
}
