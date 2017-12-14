var path = require('path')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var IS_PRODUCTION = process.env.NODE_ENV === 'production'

exports.absolutePath = function(prePath) {
  return path.resolve(__dirname, '..', prePath)
}

exports.cssLoaders = getCssLoaders

function getCssLoaders(options) {
  options = options || {}

  var cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: IS_PRODUCTION,
      sourceMap: options.sourceMap
    }
  }

  /**
   * 生成 loader 配置
   * @param {string} [ext]
   * @param {object} [loaderOptions]
   * @return {Array}
   */
  function generateLoader(ext, loaderOptions) {
    // vue-loader 会自动给 .vue 文件中的 <style> 块应用 postcss-loader，
    // 但当直接在项目中引用 CSS 文件时就不会，所以
    // 这里统一加上 postcss-loader
    var loaders = [
      cssLoader,
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: options.sourceMap
        }
      }
    ]

    if (ext) {
      loaders.push({
        loader: ext + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // 生产环境时将所有 .vue 中的 CSS 合并成一个单独的 main.css
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'style-loader'
      })
    } else {
      return ['style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoader(),
    sass: generateLoader('sass'),
    scss: generateLoader('sass')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function(options) {
  var output = []
  var loaders = getCssLoaders(options)
  for (var extension in loaders) {
    var loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }
  return output
}

exports.htmlMinify = {
  removeComments: true,
  removeCommentsFromCDATA: true,
  collapseWhitespace: true,
  conservativeCollapse: false,
  removeAttributeQuotes: true,
  removeScriptTypeAttributes: true,
  removeStyleTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,
  minifyJS: true
}
