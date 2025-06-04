import { parse } from '@babel/parser'
import traverse from '@babel/traverse'

/**
 * Extract the `export const [data|attributes]` part from a page
 * @param {string} content The content of a page
 * @param {string} filepath The absolute path to the path
 * @returns {object} The extracted data object
 */
export default (content: string, filepath: string): object => {
  const ast = parse(content, {
    sourceFilename: filepath,
    sourceType: 'module',
    plugins: ['typescript', 'jsx', 'objectRestSpread', 'classProperties'],
  })

  let data = {}

  traverse(ast, {
    ObjectExpression(path: any) {
      const name
        = path.parent
          && path.parent.type === 'VariableDeclarator'
          && path.parent.id.name

      // Only extract `export const [data|attributes] = {...}`
      if (!['attributes', 'data'].includes(name)) {
        return
      }

      const isConst
        = path.parentPath.parent && path.parentPath.parent.kind === 'const'
      if (!isConst) {
        return
      }

      const isExport
        = path.parentPath.parentPath
          && path.parentPath.parentPath.parent.type === 'ExportNamedDeclaration'
      if (!isExport) {
        return
      }

      const { confident, value } = path.evaluate()

      if (confident) {
        data = value
        path.node.properties = []
      } else {
        throw new Error(
          `"${name}" is supposed to have the same value when executed in runtime and build time.`,
        )
      }
    },
  })

  return data
}
