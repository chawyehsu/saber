import { babel } from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import builtinModules from 'builtin-modules'

export default {
  input: './index.js',
  output: {
    file: './dist/index.js',
    format: 'cjs'
  },
  plugins: [
    // https://github.com/rollup/plugins/blob/master/packages/babel/README.md#using-with-rollupplugin-commonjs
    commonjs(),
    nodeResolve(),
    json(),
    babel({
      babelHelpers: 'bundled',
      plugins: ['./babel-plugin-vue-features.mjs']
    }),
    terser()
  ],
  external: builtinModules
}
