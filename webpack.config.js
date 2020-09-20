const path = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const IgnoreEmitPlugin = require('ignore-emit-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const Dotenv = require('dotenv-webpack')

const production = process.env.WECHAT_ENV == 'production'
console.log('production', production)
// if (!process.env.WECHAT_ENV) production = true
const vueAlias = `vue/dist/vue${production ? '.min' : ''}.js`

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
  new ZipPlugin({
    path: '../',
    filename: 'WechatSync.zip',
  }),
  new UglifyJsPlugin(),
])

const productionPlugins = !production ? devPlugins : prodPlugins

const runningTests = process.env.WECHAT_ENV === 'testing'
const externals = runningTests ? [nodeExternals()] : []

function replaceSuffixes(file) {
  return file.replace('scss', 'css')
}

console.log(production, productionPlugins)

const filesToPack = [
  'background.js',
  'popup.js',
  'content.js',
  'segmenftfault.js',
  'editor.js',
  'inject.js',
  'styles.scss',
  'page.js',
  'api.js',
  'viewer.js',
  'autoformat.js',
  'template.js',
]
const entry = filesToPack.reduce(
  (o, file) =>
    Object.assign(o, {
      [replaceSuffixes(file)]: `./src/${file}`,
    }),
  {}
)

var devTools = {
  devtool: 'source-map', //inline-
}

if (production) {
  delete devTools.devtool
}

module.exports = {
  entry,
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name]',
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
    new IgnoreEmitPlugin(/\.omit$/),
    new CopyWebpackPlugin([`./src/copied`]),
    new Dotenv({
      path: './.env',
      safe: true,
    }),
  ].concat(productionPlugins),
  stats: {
    colors: true,
  },
  externals,
  ...devTools,
}
