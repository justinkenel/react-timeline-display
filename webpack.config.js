const path = require('path');
const webpack = require('webpack');
module.exports = {
  entry: './src/Timeline.jsx',
  devtool: "source-map",
  output: {
    path: path.resolve('dist'),
    filename: 'index.js',
    library:'Timeline',
    libraryTarget:'umd'
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({minimize: true})
  ]
}
