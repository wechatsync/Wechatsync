const path = require('path')
const webpack = require('webpack')
const Dotenv = require('dotenv-webpack')
const projectRoot = path.resolve(__dirname, '../../')

module.exports = env => {
  const prodMode = env.production

  return {
    mode: "production",
    entry: "./src/drivers/driver.js",
    output: {
      filename: 'driverCodePack.temp',
      path: path.resolve(__dirname, '../dist'),
      clean: true,
      library: 'modules'
    },
    optimization: {
      minimize: false,
      usedExports: false
    },
    plugins: [
      new Dotenv({
        path: path.resolve(
          projectRoot,
          prodMode ? '.env.production' : '.env.development'
        ),
        safe: true,
      }),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"',
          WECHAT_ENV: '"production"',
        },
      })
    ],
  }
}
