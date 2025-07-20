import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import scss from 'rollup-plugin-scss';

export default {
  input: 'src/index.js',
  output: {
    file: 'target/map.js',
    format: 'iife',
  },
  plugins: [
    commonjs(),
    scss({ output: 'target/style.css' }),
    json(),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true,
    }),
    nodeResolve(),
  ],
};
