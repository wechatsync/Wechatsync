const path = require('path')
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const { VueLoaderPlugin } = require('vue-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const Dotenv = require('dotenv-webpack')
const TerserPlugin = require('terser-webpack-plugin')
const IgnoreEmitPlugin = require('ignore-emit-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const projectRoot = path.resolve(__dirname, '../../')

const entry = (function() {
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

  function replaceSuffixes(file) {
    return file.replace('scss', 'css')
  }

  return filesToPack.reduce(
    (o, file) =>
      Object.assign(o, {
        [replaceSuffixes(file)]: `./src/${file}`,
      }),
    {}
  )
})()

module.exports = env => {
  const prodMode = env.production
  const prodConfigs = {
    mode: 'production',
    resolve: {
      alias: {
        vue: 'vue/dist/vue.min.js',
      },
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          test: /\.js(\?.*)?$/i,
          exclude: /\.min\.js$/i,
        }),
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"',
          WECHAT_ENV: '"production"'
        },
      }),
      new ZipPlugin({
        path: path.resolve(__dirname, 'zip'),
        filename: 'WechatSync.zip',
      }),
    ],
  }
  const devConfigs = {
    mode: 'development',
    devtool: 'inline-source-map',
    resolve: {
      alias: {
        vue: 'vue/dist/vue.js',
      },
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"development"',
        },
      }),
    ],
  }

  const commonConfigs = {
    entry,
    output: {
      filename: '[name]',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.(sa|sc|c)ss$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.js?$/,
          loader: 'babel-loader',
          exclude: file =>
            (/node_modules/.test(file) && !/\.vue\.js/.test(file)) ||
            /\.min\.js$/i.test(file),
          options: {
            rootMode: 'upward',
          },
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
      new IgnoreEmitPlugin(/\.omit$/),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/copied',
          },
        ],
      }),
      new VueLoaderPlugin(),
      new Dotenv({
        path: path.resolve(
          projectRoot,
          prodMode ? '.env.production' : '.env.development'
        ),
        safe: true,
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  }

  return merge(commonConfigs, prodMode ? prodConfigs : devConfigs)
}
