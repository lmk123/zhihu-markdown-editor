module.exports = {
  staticRoot: 'static',
  // images and fonts less than 2KB will transform to Data URI by url-loader
  fileLimit: 2000,
  build: {
    assetsRoot: 'dist',
    publicPath: '',
    sourceMap: false,
    env: {
      NODE_ENV: '"production"'
    },
    analyzer: true
  },
  dev: {
    sourceMap: true,
    env: {
      NODE_ENV: '"development"'
    }
  }
}
