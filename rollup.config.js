import typescript from "rollup-plugin-typescript2";
import nodeResolve from "rollup-plugin-node-resolve";
import istanbul from 'rollup-plugin-istanbul';
import commonjs from "rollup-plugin-commonjs";

let pkg = require('./package.json');
let external = [];
let plugins = [
];

if (process.env.BUILD !== 'production') {
    plugins.push(istanbul({
        exclude: ['test/**/*', 'node_modules/**/*']
    }));
}

export default {
    banner: '/*\n * Orange '+pkg.name+'\n * version : ' + pkg.version+' \n * Copyright (C) 2017 Orange\n */\n ',
    moduleName: 'ocast',
    entry: './ocast.ts',
    external: external,
    targets: [
        {
            dest: pkg.main,
            format: 'es',
            moduleName: 'ocast',
            sourceMap: true
        },
        {
            dest: pkg.module,
            format: 'es',
            sourceMap: true
        }
    ],
    plugins: [
        typescript(),
        nodeResolve({jsnext: true, module: true}),
        commonjs({
            include: 'node_modules/**'
        })
    ]
}