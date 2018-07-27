/**
 * Base webpack config used across other specific configs
 */
const path = require('path')
const webpack = require('webpack')
const ROOT_FOLDER = __dirname
const SRC_FOLDER = path.join(ROOT_FOLDER, 'src')
const DIST_FOLDER = path.join(ROOT_FOLDER, 'dist')
const port = process.env.PORT || 3002
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanCSSPlugin = require("less-plugin-clean-css")
const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'

const extractLess = new ExtractTextPlugin({
  filename: 'cryptovista.[chunkhash].css',
  disable: IS_DEVELOPMENT
})

let entry = []

if (IS_DEVELOPMENT) {
  entry = entry.concat([
    `webpack-dev-server/client?http://localhost:${port}`,
    `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr`,
    path.join(SRC_FOLDER, 'index.js')
  ])
}

if (IS_PRODUCTION) {
  entry = entry.concat([
    path.join(SRC_FOLDER, 'index.js')
  ])
}

const output = {
  path: path.join(__dirname, 'dist'),
  filename: IS_PRODUCTION ? 'cryptovista.[chunkhash].js' : 'cryptovista.js',
  publicPath: IS_PRODUCTION ? '/' : `http://localhost:${port}`,
}

if (IS_DEVELOPMENT) {
  // https://github.com/webpack/webpack/issues/1114
  // output.libraryTarget = 'commonjs2'
}

let plugins = [
  // NODE_ENV should be production so that modules do not perform certain development checks
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development')
  }),

  extractLess,

  new HtmlWebpackPlugin({
    filename: 'download/index.html',
    template: path.join(SRC_FOLDER, 'download', 'index.html'),
  }),

  new HtmlWebpackPlugin({
    filename: 'terms-and-conditions/index.html',
    template: path.join(SRC_FOLDER, 'terms-and-conditions', 'index.html'),
  }),

  new HtmlWebpackPlugin({
    filename: 'index.html',
    template: path.join(SRC_FOLDER, 'index.html'),
  }),

  new CopyWebpackPlugin([
    {from: SRC_FOLDER, to: DIST_FOLDER, ignore: ['**/less/**', 'index.js', 'index.html', '**/imagesRaw/**']}
  ]),
]

if (IS_DEVELOPMENT) {
  plugins.push(new webpack.HotModuleReplacementPlugin())
}

module.exports = {
  mode: IS_PRODUCTION ? 'production' : 'development',
  devtool: 'source-map',
  entry,
  module: {
    rules: [
      {
        test: /\.json$/,
        loader: 'json-loader',
        type: 'javascript/auto'
      },
      {
        test: /\.less$/,
        use: extractLess.extract({
          use: [
            'css-loader',
            {
              loader: 'less-loader',
              options: {
                plugins: [new CleanCSSPlugin({ advanced: true })]
              }
            }
          ],
          fallback: 'style-loader',
        })
      },
      {
        test: /.*images.+\.(svg|jpg)$/,
        loader: 'url-loader',
      },
      {
        test: /.*svg-sprite.+\.svg$/,
        loader: 'svg-sprite-loader',
        // options: {extract: true}
      }
    ]
  },

  output,

  // https://webpack.github.io/docs/configuration.html#resolve
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    mainFields: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main']
  },

  plugins,
 
}
