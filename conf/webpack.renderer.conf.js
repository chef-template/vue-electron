const webpack = require('webpack')
const { resolve } = require('path')
const merge = require('webpack-merge')
const { isDev, isProd } = require('./constants')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

let config = {
    entry: {
        main: [resolve(process.cwd(), 'app/entry.js')]
    },
    output: {
        publicPath: '/',
        filename: 'bundle.js',
        path: resolve(process.cwd(), 'dist')
    },
    resolve: {
        extensions: ['.js', '.css', '.vue', '.json'],
        alias: {
            'vue': 'vue/dist/vue.runtime.common.js',
            'pages': resolve(process.cwd(), 'app/pages'),
            'plugins': resolve(process.cwd(), 'app/plugins'),
            'components': resolve(process.cwd(), 'app/components')
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: resolve(process.cwd(), './app/index.html')
        })
    ],
    module: {
        rules: [{
            test: /\.vue$/,
            use: {
                loader: 'vue-loader',
                options: {
                    extractCSS: !isDev,
                    preserveWhitespace: false
                }
            }
        }, {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader'
            }
        }, {
            test: /\.css$/,
            use: isDev ? ['style-loader', 'css-loader'] : ExtractTextPlugin.extract({
                use: 'css-loader',
                fallback: 'style-loader'
            })
        }, {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            use: {
                loader: 'url-loader',
                options: {
                    limit: 1,
                    name: 'img/[name].[hash:7].[ext]'
                }
            }
        }, {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            use: {
                loader: 'url-loader',
                options: {
                    limit: 1,
                    name: 'img/[name].[hash:7].[ext]'
                }
            }
        }]
    },
    target: 'electron-renderer'
}

if (isDev) {
    config = merge(config, {
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: '"develop"'
                }
            })
        ],
        devServer: {
            noInfo: true,
            quiet: true
        }
    })
}

if (isProd) {
    config = merge(config, {
        entry: {
            vendors: ['vue', 'vuex', 'vue-router']
        },
        output: {
            publicPath: './',
            filename: 'js/[name].[hash:7].js',
            chunkFilename: 'js/[id].[hash:7].js',
            path: resolve(process.cwd(), 'dist/app')
        },
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
            }),
            new ExtractTextPlugin('css/[name].[hash:7].css'),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendors',
                filename: 'js/vendors.[hash:7].js'
            })
        ]
    })
}

module.exports = config