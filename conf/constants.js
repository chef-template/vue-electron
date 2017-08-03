const { sep } = require('path')

const DEV_URL = 'http://localhost:8080/#/hello'
const PROD_URL = `file://${__dirname}${sep}app${sep}index.html#/hello`

exports.isWin = process.platform === 'win32'
exports.isLinux = process.platform === 'linux'
exports.isMacOS = process.platform === 'darwin'
exports.isTest = process.env.NODE_ENV === 'test'
exports.isDev = process.env.NODE_ENV === 'develop'
exports.isProd = process.env.NODE_ENV === 'production'
exports.url = exports.isDev ? DEV_URL : PROD_URL