var webpackBaseConfig = require('./webpack.base.config')
var webpack = require('webpack')
var utils = require('./utils')
var merge = require('webpack-merge')
var config = require('./config')

module.exports = merge(webpackBaseConfig, {
  devtool: config.dev.sourceMap ? 'inline-source-map' : false,
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.dev.env
    })
  ]
})
