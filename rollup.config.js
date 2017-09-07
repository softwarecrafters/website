import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import nodeResolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";

export default {
  input: "src/index.js",
  output: {
    file: "target/map.js",
    format: "cjs"
  },
  plugins: [
    json(),
    babel({
      exclude: "node_modules/**"
    }),
    nodeResolve({
      jsnext: true,
      main: true
    }),
    commonjs()
  ]
};
