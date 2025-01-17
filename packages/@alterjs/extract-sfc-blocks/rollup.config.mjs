import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import pkg from './package.json' assert { type: 'json' }

export default {
  input: './src/index.ts',
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
    commonjs(),
    json(),
    typescript(),
    terser(),
  ],
}
