import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import json from '@rollup/plugin-json'
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
export default {
    input: ["./index.ts"],
    output: [
        {
            dir: "dist",
            format: 'cjs',
            plugins: [terser()]
        }
    ],
    plugins: [resolve(), commonjs(), babel(), json(), typescript()],
    external: ["react", "react-native"]
};