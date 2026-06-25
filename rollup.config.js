import terser from "@rollup/plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default [
    // CommonJS
    {
        input: "src/index.ts",
        output: {
            dir: "dist/cjs",
            format: "cjs",
            preserveModules: true,
        },
        external: [
            "fetch-xhr-shim",
            "fetch-xhr-shim/dev",
            "miniprogram-platform",
            "url-parse",
            "valid-url",
            "set-cookie-parser",
        ],
        plugins: [
            typescript({
                outDir: "dist/cjs",
                declarationDir: "dist/cjs/types",
                ignoreDeprecations: "6.0",
            }),
        ],
    },

    // CommonJS (singlefile)
    {
        input: "src/index.ts",
        output: {
            file: "dist/miniprogram-xmlhttprequest-shim.cjs.min.js",
            format: "cjs",
        },
        plugins: [
            typescript({
                declarationDir: "dist/types",
                ignoreDeprecations: "6.0",
            }),
            commonjs(),
            nodeResolve(),
            terser(),
        ],
    },

    // ES6
    {
        input: "src/index.ts",
        output: {
            dir: "dist/esm",
            format: "es",
            preserveModules: true,
        },
        external: [
            "fetch-xhr-shim",
            "fetch-xhr-shim/dev",
            "miniprogram-platform",
            "url-parse",
            "valid-url",
            "set-cookie-parser",
        ],
        plugins: [
            typescript({
                outDir: "dist/esm",
                declarationDir: "dist/esm/types",
                ignoreDeprecations: "6.0",
            }),
        ],
    },

    // ES6 (singlefile)
    {
        input: "src/index.ts",
        output: {
            file: "dist/miniprogram-xmlhttprequest-shim.esm.min.js",
            format: "es",
        },
        plugins: [
            typescript({
                declarationDir: "dist/types",
                ignoreDeprecations: "6.0",
            }),
            commonjs(),
            nodeResolve(),
            terser(),
        ],
    },


    // Types
    {
        input: "dist/esm/types/index.d.ts",
        output: {
            file: "dist/index.d.ts",
            format: "es",
        },
        plugins: [dts()],
    },

    // Types (dev)
    {
        input: "dist/esm/types/dev.d.ts",
        output: {
            file: "dist/dev.d.ts",
            format: "es",
        },
        plugins: [dts()],
    },
];
