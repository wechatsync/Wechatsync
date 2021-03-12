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
