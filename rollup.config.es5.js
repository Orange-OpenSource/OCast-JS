import typescript from "rollup-plugin-typescript2";
import babel from 'rollup-plugin-babel';
import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

let pkg = require('./package.json');
let external = [];
if (process.env.BUILD !== 'production') {
}

export default {
    banner: '/*\n * Orange '+pkg.name+'\n * version : ' + pkg.version+' \n * Copyright (C) 2017 Orange\n */\n ',
    moduleName: 'ocast',
    entry: './ocast.ts',
    external: external,
    targets: [
        {
            dest: 'dist/ocast.es5.js',
            format: 'iife',
            moduleName: 'ocast',
            sourceMap: true
        }
    ],
    plugins: [
        typescript(),
        nodeResolve({jsnext: true, module: true}),
        commonjs({
            include: 'node_modules/**'
        }),
        babel({
            exclude: 'node_modules/**',
        })
    ]
}