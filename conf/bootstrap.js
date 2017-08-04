const app = require('koa')()
const { parse } = require('url')
const webpack = require('webpack')
const electron = require('electron')
const { url } = require('./constants')
const logger = require('../utils/logger')
const { resolve, join } = require('path')
const { spawn } = require('child_process')
const webpackHotMiddleware = require('webpack-hot-middleware')
const webpackDevMiddleware = require('koa-webpack-dev-middleware')

const WEBPACK_MAIN_CONFIG = resolve(process.cwd(), './conf/webpack.main.conf')
const WEBPACK_RENDERER_CONFIG = resolve(process.cwd(), './conf/webpack.renderer.conf')

let restart, mainProcess

function startRenderer() {
    let port, config, compiler, hotMiddleware

    port = parse(url).port || 80
    config = require(WEBPACK_RENDERER_CONFIG)

    config.devServer.hot = true
    config.devServer.publicPath = config.output.publicPath
    config.plugins.unshift(new webpack.NoEmitOnErrorsPlugin())
    config.plugins.unshift(new webpack.HotModuleReplacementPlugin())
    config.entry.main.unshift('webpack-hot-middleware/client?reload=true')

    compiler = webpack(config)
    hotMiddleware = koaWebpackHotMiddleware(compiler, { log: rendererLogger })

    compiler.plugin('compilation', (compilation) => {
        compilation.plugin('html-webpack-plugin-after-emit', (data, done) => {
            hotMiddleware.publish({ action: 'reload' })
            done()
        })
    })

    app.use(webpackDevMiddleware(compiler, config.devServer))
    app.use(hotMiddleware)
    app.use(function* (next) {
        this.body = yield readFile(compiler, 'index.html')
    })

    return new Promise((resolve, reject) => {
        app.listen(port, (err) => {
            if (err) { return reject(err) }
            resolve()
        })
    })
}

function startMain() {
    return new Promise((resolve, reject) => {
        let timefix, compiler
        
        timefix = 11000
        compiler = webpack(require(WEBPACK_MAIN_CONFIG))

        //fix bug: https://github.com/webpack/watchpack/issues/25
        compiler.plugin('watch-run', (compilation, done) => {
            compilation.startTime += timefix
            done()
        })

        compiler.plugin('done', (stats) => {
            stats.startTime -= timefix
        })

        compiler.watch({}, (err, stats) => {
            if (err) { return reject(err) }
                
            mainLogger(stats)
            
            if (mainProcess) {
                restart = true
                process.kill(mainProcess.pid)
                startElectron().then(() => restart = false)
            }

            resolve()
        })
    })
}

function startElectron() {
    return new Promise((resolve) => {
        mainProcess = spawn(...getCommand())
        
        mainProcess.on('close', () => {
            if (!restart) {
                process.exit()
            }

            resolve()
        })
        
        mainProcess.stdout.on('data', (data) => console.log(data.toString()))
        mainProcess.stderr.on('data', (data) => console.log(data.toString()))
    })
}

function run() {
    return getVersions().then((data) => {
        logger('Version', `Node version: ${data[0]}`)
        logger('Version', `Electron version: ${data[2]}`)
        logger('Version', `Chrome version: ${data[1]}`)

        return Promise.all([startMain(), startRenderer()])
    })
}

function getCommand() {
    const command = './node_modules/.bin/cross-env'
    const args = ['NODE_ENV=develop', electron, resolve(process.cwd(), './dist/main.js')]

    return [command, args]
}

function mainLogger(stats) {
    stats = stats.toJson({ errorDetails: false })

    logger('Main', `webpack built ${stats.hash} in ${stats.time}ms`)
}

function rendererLogger(message) {
    if (message.indexOf('webpack building') === -1) {
        logger('Renderer', message)
    }
}

function* readFile(compiler, fileName) {
    return new Promise((resolve, reject) => {
        compiler.outputFileSystem.readFile(join(compiler.outputPath, fileName), (err, result) => {
            if (err) { return reject(err) }
            resolve(result)
        })
    })
}

function koaWebpackHotMiddleware(compiler, option) {
    let hotMiddleware, middleware
    
    hotMiddleware = webpackHotMiddleware(compiler, option)
    middleware = function* (next) {
        let nextStep = yield (function(action, req, res, end) {
            return function(done) {
                res.end = function() {
                    end.apply(this, arguments)
                    done(null, 0)
                }

                action(req, res, function() {
                    done(null, 1)
                })
            }
        })(hotMiddleware, this.req, this.res, this.res.end)

        if(nextStep && next) {
            yield* next
        }
    }

    middleware.publish = hotMiddleware.publish

    return middleware
}

function getVersions() {
    return new Promise((done, reject) => {
        let child = spawn(electron, [resolve(process.cwd(), './utils/versions.js')])

        child.stdout.on('data', (data) => {
            done(data.toString().replace(/\r?\n/, '').split(','))
            process.kill(child.pid)
        })

        child.stderr.on('data', (data) => {
            reject(data.toString())
            process.kill(child.pid)
        })
    })
}

run().then(() => startElectron()).catch(console.log)