var webpackBaseConfig = require('./webpack.base.config')
var webpack = require('webpack')
var merge = require('webpack-merge')
var config = require('./config')

module.exports = merge(webpackBaseConfig, {
  devtool: config.dev.sourceMap ? 'inline-source-map' : false
})
