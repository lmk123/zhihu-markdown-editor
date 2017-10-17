var webpack = require('webpack')
var utils = require('./utils')
var config = require('./config')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var CleanWebpackPlugin = require('clean-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  entry: {
    'content-answer': './src/content-script/answer/index.ts',
    'content-question': './src/content-script/question/index.ts'
  },
  output: {
    path: utils.absolutePath(config.build.assetsRoot),
    publicPath: config.build.publicPath,
    filename: 'js/[name].js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader',
        include: utils.absolutePath('src')
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: config.fileLimit,
          name: 'images/[name].[hash].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: config.fileLimit,
          name: 'fonts/[name].[hash].[ext]'
        }
      }
    ].concat(utils.styleLoaders({
      sourceMap: config.build.sourceMap,
      extract: true
    }))
  },
  plugins: [
    new CleanWebpackPlugin([config.build.assetsRoot], {
      root: utils.absolutePath('')
    }),
    new CopyWebpackPlugin([
      {
        from: utils.absolutePath(config.staticRoot),
        ignore: ['.*']
      }
    ]),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'content-common',
      chunks: ['content-answer', 'content-question']
    }),
    new ExtractTextPlugin({
      filename: '[name].css',
      // 如果不加下面这一行会报错
      // https://github.com/webpack/webpack/issues/959#issuecomment-276685210
      allChunks: true
    }) // ,
    // new HtmlWebpackPlugin({
    //   chunks: ['background'],
    //   filename: 'background.html',
    //   minify: utils.htmlMinify
    // })
  ]
}
