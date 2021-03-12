const path = require('path')
const production = process.env.WECHAT_ENV == 'production'

var devTools = {
  devtool: 'source-map', //inline-
}

if (production) {
  delete devTools.devtool
}

module.exports = {
  mode: 'production',
  entry: "./index.js",
  output: {
    path: __dirname + '/dist',
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        exclude: (file) =>
          /node_modules/.test(file)
      },
    ],
  },
}
