# OCast
[![npm version](https://badge.fury.io/js/ocast-sdk.svg)](http://badge.fury.io/js/ocast-sdk)
[![node](https://img.shields.io/node/v/ocast-sdk-iconify.svg)](https://www.npmjs.com/package/ocast-sdk-iconify)
[![Build Status](https://travis-ci.org/Orange-OpenSource/OCast-JS.svg?branch=master)](https://travis-ci.org/Orange-OpenSource/OCast-JS)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

## Requirements

### modules
Prior to ES2015 (ES6) there was no module system in the standard of the ECMAScript language. What we had (and still have) instead, are different implementation patterns for “simulating” a module system: there are the simple IIFEs (Immediately Invoked Function Expression), UMD (Universal Module Definition), AMD (Asynchronous Module Definition) and CommonJS. ES6 finally introduced a standard way of defining modules

### babel.js
Because the JS is used in the frontend, we still need to compile the ES2015 code to ES5 as long as the evergreen browsers do not support your favorite new features natively.

### License

All code in this repository is covered by the [Apache-2.0 license](http://www.apache.org/licenses/LICENSE-2.0). See LICENSE file for copyright details.

### Installation
```bash
sudo npm i -g rollup
npm i

```


### Development

#### Compilation
```bash
npm run dev
npm run build

```

#### test
```bash
npm test
```
