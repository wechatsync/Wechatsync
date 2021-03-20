const path = require('path')
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const Dotenv = require('dotenv-webpack')
const TerserPlugin = require('terser-webpack-plugin')
const projectRoot = path.resolve(__dirname, '../../')

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
        }),
      ],
    },
  }
  const devConfigs = {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
      contentBase: './dist',
    },
    resolve: {
      alias: {
        vue: 'vue/dist/vue.js',
      },
    },
  }
  return merge(
    {
      entry: './src/main.js',
      output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'src'),
        },
      },
      module: {
        rules: [
          {
            test: /\.(sa|sc|c)ss$/i,
            use: [
              prodMode ? MiniCssExtractPlugin.loader : 'style-loader',
              'css-loader',
              'sass-loader',
            ],
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
            resourceQuery: { not: [/raw/] },
            loader: 'babel-loader',
            exclude: file =>
              /node_modules/.test(file) &&
              !/\.vue\.js/.test(file) &&
              !/node_modules\/vue\-awesome/.test(file),
            options: {
              rootMode: 'upward',
            },
          },
          {
            test: /\.vue$/,
            loader: 'vue-loader',
          },
          {
            test: /\.md$/,
            resourceQuery: { not: [/raw/] },
            use: [
              {
                loader: 'vue-loader',
              },
              {
                loader: 'vue-markdown-loader/lib/markdown-compiler',
                options: {
                  raw: true,
                },
              },
            ],
          },
          {
            resourceQuery: /raw/,
            type: 'asset/source',
          },
        ],
      },
      plugins: [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        }),
        new MiniCssExtractPlugin({
          filename: 'styles.css',
        }),
        new HtmlWebpackPlugin({
          template: 'public/index.html',
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
    },
    prodMode ? prodConfigs : devConfigs
  )
}
