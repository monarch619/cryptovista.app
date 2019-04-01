/**
 * Base webpack config used across other specific configs
 */
const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const ROOT_FOLDER = __dirname
const SRC_FOLDER = path.join(ROOT_FOLDER, 'src')
const DIST_FOLDER = path.join(ROOT_FOLDER, 'dist')
const port = process.env.PORT || 3003
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CleanCSSPlugin = require("less-plugin-clean-css")
const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'

const extractLess = new ExtractTextPlugin({
  filename: 'css/cryptovista.[chunkhash].css',
  disable: IS_DEVELOPMENT
})

const pathsToClean = [
  'dist',
]

let entry = {
  download: path.join(SRC_FOLDER, 'download', 'download.script.js'),
}

if (IS_DEVELOPMENT) {
  entry.app = [
    `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr`,
    path.join(SRC_FOLDER, 'index.js')
  ]
}

if (IS_PRODUCTION) {
  entry.app = path.join(SRC_FOLDER, 'index.js')
}

const output = {
  path: path.join(__dirname, 'dist'),
  filename: IS_PRODUCTION ? 'scripts/[name].[chunkhash].js' : 'scripts/[name].js',
  publicPath: IS_PRODUCTION ? '/' : `http://localhost:${port}/`,
}

let plugins = [
  new CleanWebpackPlugin(pathsToClean),

  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development')
  }),

  extractLess,

  new HtmlWebpackPlugin({
    filename: 'download/index.html',
    template: path.join(SRC_FOLDER, 'download', 'index.html'),
    chunks: ['manifest', 'app', 'download'],
  }),

  new HtmlWebpackPlugin({
    filename: 'terms-and-conditions/index.html',
    template: path.join(SRC_FOLDER, 'terms-and-conditions', 'index.html'),
    chunks: ['manifest', 'app'],
  }),

  new HtmlWebpackPlugin({
    filename: 'index.html',
    template: path.join(SRC_FOLDER, 'index.html'),
    chunks: ['manifest', 'app'],
  }),

  new HtmlWebpackPlugin({
    filename: 'releases/index.html',
    template: path.join(SRC_FOLDER, 'releases', 'index.html'),
    chunks: ['manifest', 'app'],
  }),

  new CopyWebpackPlugin([
    {from: SRC_FOLDER, to: DIST_FOLDER, ignore: ['**/less/**', '*.js', 'index.html', '**/imagesRaw/**']}
  ]),
]

function listDirs (rootDir) {
  return fs.readdirSync(rootDir).filter((file) => fs.statSync(path.join(rootDir, file)).isDirectory())
}

const releases = listDirs(path.join(ROOT_FOLDER, 'src', 'releases'))
const releasePages = releases.map((version) => {
  return new HtmlWebpackPlugin({
    filename: `releases/${version}/index.html`,
    template: path.join(SRC_FOLDER, 'releases', version, 'index.html'),
    chunks: ['manifest', 'app'],
  })
})

plugins = plugins.concat(releasePages)

if (IS_DEVELOPMENT) {
  plugins.push(new webpack.HotModuleReplacementPlugin())
}

module.exports = {
  mode: IS_PRODUCTION ? 'production' : 'development',
  devtool: 'source-map',
  entry,
  optimization: {
    runtimeChunk: {
      name: "manifest",
    },
  },
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
