const path = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const IgnoreEmitPlugin = require('ignore-emit-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const Dotenv = require('dotenv-webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const production = process.env.WECHAT_ENV == 'production'

// if (!process.env.WECHAT_ENV) production = true
const vueAlias = `vue/dist/vue${production ? '.min' : ''}.js`
const appType = process.env.APP_TYPE || 'editor'
const entryApps = {}
let outputPath = path.resolve(__dirname, './md')
let copyAssetsDir = [
  `./src/markdown/copied`,
  `./src/copied/css`
]

console.log('production', production, {
  appType
})

if(appType == 'devtool') {
  entryApps['devtool'] = `./src/packages/devtool/devtool.js`,
  outputPath = path.resolve(__dirname, './devtool')
  copyAssetsDir = [
    `./src/packages/devtool/copied`,
    `./src/copied/css`
  ]
} else {
  entryApps['md'] = `./src/md.js`
}

const devPlugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: '"development"',
    },
  }),
]
const prodPlugins = devPlugins.concat([
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: '"production"',
    },
  }),
//   new ZipPlugin({
//     path: '../',
//     filename: 'WechatSync.zip',
//   }),
  new UglifyJsPlugin(),
])

const productionPlugins = !production ? devPlugins : prodPlugins

const runningTests = process.env.WECHAT_ENV === 'testing'
const externals = runningTests ? [nodeExternals()] : []

function replaceSuffixes(file) {
  return file.replace('scss', 'css')
}

console.log(production, productionPlugins)

var devTools = {
  devtool: 'source-map', //inline-
}

if (production) {
  delete devTools.devtool
}

module.exports = {
  entry: entryApps,
  output: {
    path: outputPath,
    filename: '[name].js',
  },
  resolve: {
    alias: {
      vue: vueAlias,
      'extension-streams': 'extension-streams/dist/index.js',
      'aes-oop': 'aes-oop/dist/AES.js',
    },
    modules: [path.join(__dirname, 'node_modules')],
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-3'],
        },
        exclude: /node_modules/,
        // include: [
        //   path.resolve('node_modules/vue-awesome')
        // ]
      },
    ],
    rules: [
      // { test: /(\.css$)/, loaders: ExtractTextPlugin.extract(['css-loader']) },
      // { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' },
      {
        test: /\.(sass|scss|css)$/,
        loader: ExtractTextPlugin.extract(['css-loader', 'sass-loader']),
      },
      {
        test: /\.(html|png|woff|woff2|eot|ttf|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            js: 'babel-loader',
            scss: 'vue-style-loader!css-loader!sass-loader',
            css: 'vue-style-loader!css-loader',
          },
        },
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].css',
      allChunks: true,
    }),
    // new HtmlWebpackPlugin({
    //   filename: path.resolve(__dirname, './md/index.html'),
    //   template: __dirname + '/src/markdown/copied/index.html',
    //   inject: true,
    //   minify: {
    //     removeComments: true,
    //     collapseWhitespace: true,
    //     removeAttributeQuotes: true,
    //     // more options:
    //     // https://github.com/kangax/html-minifier#options-quick-reference
    //   },
    //   // necessary to consistently work with multiple chunks via CommonsChunkPlugin
    //   chunksSortMode: 'dependency',
    // }),
    new IgnoreEmitPlugin(/\.omit$/),
    new CopyWebpackPlugin(copyAssetsDir),
    // new CopyWebpackPlugin([`./src/markdown/copied`]),
    // new CopyWebpackPlugin([`./src/copied/css`]),
    new Dotenv({
      path: !production ? './.env.development' : './.env.production',
      safe: true,
    }),
  ].concat(productionPlugins),
  stats: {
    colors: true,
  },
  externals,
  ...devTools,
}
