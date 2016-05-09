var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: "./entry.js",
  output: {
    path: __dirname + "/client",
    filename: "bundle.js"
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style!css" },
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  }
};