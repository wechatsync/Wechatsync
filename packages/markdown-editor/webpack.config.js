const path = require('path')
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
  return {
    ...(prodMode ? prodConfigs : devConfigs),
    entry: './src/index.js',
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.(sa|sc|c)ss$/i,
          use: [
            prodMode ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
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
          loader: 'babel-loader',
          exclude: file => /node_modules/.test(file) && !/\.vue\.js/.test(file),
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
        filename: 'styles.css',
      }),
      new HtmlWebpackPlugin({
        template: 'src/index.html',
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
  }
}
