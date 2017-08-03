const webpack = require('webpack')
const { resolve } = require('path')
const merge = require('webpack-merge')
const { isDev, isProd } = require('./constants')
const { dependencies } = require('../package.json')

let config = {
    entry: {
        main: resolve(process.cwd(), './main.js')
    },
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: resolve(process.cwd(), './dist')
    },
    externals: [...Object.keys(dependencies || {})],
    resolve: {
        extensions: ['.js', '.json', '.node'],
        alias: {
            'utils': resolve(process.cwd(), 'utils')
        }
    },
    node: {
        __dirname: process.env.NODE_ENV !== 'production'
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin()
    ],
    module: {
        rules: [{
            test: /\.js$/,
            use: 'babel-loader',
            exclude: /node_modules/
        }, {
            test: /\.node$/,
            use: 'node-loader'
        }]
    },
    target: 'electron-main'
}

if (isDev) {
    config = merge(config, {
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: '"develop"'
                }
            })
        ]
    })
}

if (isProd) {
    config = merge(config, {
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: '"production"'
                }
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        ]
    })
}

module.exports = config