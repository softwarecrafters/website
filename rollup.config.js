import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import sass from 'rollup-plugin-sass';

export default {
  input: 'src/index.js',
  output: {
    file: 'target/map.js',
    format: 'iife',
  },
  plugins: [
    commonjs(),
    sass({
      output: 'target/style.css',
      api: 'modern',
      options: {
        style: 'compressed',
      },
      include: ['**/*.css', '**/*.sass', '**/*.scss'],
      exclude: '',
    }),
    json(),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true,
    }),
    nodeResolve(),
  ],
};
