/*
 * Webpack development server configuration
 *
 * This file is set up for serving the webpack-dev-server, which will watch for changes and recompile as required if
 * the subfolder /webpack-dev-server/ is visited. Visiting the root will not automatically reload.
 */
'use strict';

var path = require('path');
var webpack = require('webpack');
var _ = require('lodash');

var port = 8000;

module.exports = {
    output: {
        // The path: property is needed to keep webpack dev server from barfing under some conditions.
        path: path.join(__dirname, 'assets'),
        filename: 'main.js',
        publicPath: '/assets/'
    },
    devtool: 'eval-source-map',
    entry: [
        'webpack-dev-server/client?http://0.0.0.0:' + port,
        'webpack/hot/only-dev-server',
        'bootstrap-sass/assets/stylesheets/_bootstrap.scss',
        'babel/polyfill',
        './main.jsx'
    ],
    resolve: {
        extensions: ['', '.js', '.jsx'],
        alias: {
            'mindfront-react-components': path.join(__dirname, 'mindfront-react-components'),
        }
    },
    node: {
        fs: 'empty', // I still don't understand why this is necessary to prevent an error...
    },
    module: {
        loaders: [{
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            loader: 'react-hot!babel?stage=0'
        }, {
            test: /\.sass/,
            loader: 'style-loader!css-loader!sass-loader?indentedSyntax&outputStyle=expanded&' +
            "includePaths[]=" +
            (path.resolve(__dirname, "./node_modules"))
        }, {
            test: /\.scss/,
            loader: 'style-loader!css-loader!sass-loader?outputStyle=expanded&' +
            "includePaths[]=" +
            (path.resolve(__dirname, "./node_modules"))
        }, {
            test: /\.css$/,
            loader: 'style-loader!css-loader'
        }, {
            test: /\.(png|jpg)$/,
            loader: 'url-loader?limit=8192'
        },
            { test: /\.woff\d?(\?v=\d+\.\d+\.\d+)?$/,   loader: "url?limit=10000&minetype=application/font-woff" },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,    loader: "url?limit=10000&minetype=application/octet-stream" },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,    loader: "file" },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,    loader: "url?limit=10000&minetype=image/svg+xml" }
        ]
    },
    plugins: [
        new webpack.PrefetchPlugin('react/addons'),
        new webpack.PrefetchPlugin('react'),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
    ],
    devServer: {
        port: port,
        host: '0.0.0.0',
        hot: true,
        historyApiFallback: true,
    }
};