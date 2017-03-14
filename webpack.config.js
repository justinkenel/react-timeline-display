const path = require('path');
module.exports = {
  entry: './src/Timeline.jsx',
  output: {
    path: path.resolve('dist'),
    filename: 'index.js',
    library:'reactTimelineDisplay',
    libraryTarget:'umd'
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  }
}
