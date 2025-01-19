// @ts-expect-error - no types
import ChainedMap from 'rspack-chain/src/ChainedMap'

export default class extends ChainedMap {
  [x: string]: any

  constructor(parent: any) {
    super(parent)

    this.extend([
      'html',
      'xhtmlOut',
      'breaks',
      'langPrefix',
      'linkify',
      'typographer',
      'quotes',
      'highlight',
    ])
  }
}
