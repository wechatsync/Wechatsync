const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const production = process.env.WECHAT_ENV == 'production'
// if (!process.env.WECHAT_ENV) production = true;

var devTools = {
  devtool: 'source-map', //inline-
}

if (production) {
  delete devTools.devtool
}

module.exports = {
  entry: {
    driver: './src/drivers/driver.js',
  },
  //   mode: 'development',
  output: {
    path: __dirname + '/bundle/',
    filename: 'driver.js',
  },
  resolve: {
    modules: [path.join(__dirname, 'node_modules')],
  },
  module: {
    loaders: [
      //   {
      //     test: /\.js$/,
      //     loader: "babel-loader",
      //     query: {
      //       presets: ["es2015", "stage-3"]
      //     },
      //     exclude: /node_modules/
      //   }
    ],
  },
  plugins: [
    // new UglifyJsPlugin()
  ],
}
