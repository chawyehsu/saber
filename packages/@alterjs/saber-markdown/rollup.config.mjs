import { babel } from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import builtinModules from 'builtin-modules'
import typescript from '@rollup/plugin-typescript'
import pkg from './package.json' assert { type: "json" }

export default {
  input: './index.ts',
  output: [
    {
      file: pkg.exports['.'].import,
      format: 'esm',
    },
    {
      file: pkg.exports['.'].require,
      format: 'cjs',
    },
  ],
  plugins: [
    // https://github.com/rollup/plugins/blob/master/packages/babel/README.md#using-with-rollupplugin-commonjs
    commonjs(),
    nodeResolve(),
    json(),
    typescript(),
    babel({
      babelHelpers: 'bundled',
      plugins: ['./babel-plugin-vue-features.mjs']
    }),
    terser()
  ],
  external: builtinModules
}
