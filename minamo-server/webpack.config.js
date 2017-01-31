'use strict';

const webpack = require('webpack')
    , path = require('path');

let plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }),
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    toastr: 'toastr',
  }),
];

if(process.env.NODE_ENV === 'production'){
  plugins = plugins.concat([
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      mangle: true,
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
  ]);
}

module.exports = {
  entry: {
    bundle: './src/client.js',
    styles: './src/loader.js',
  },
  output: {
    path: './public',
    filename: '[name].js'
  },
  module: {
    rules: [
      { test: /\.js$/, use: 'babel-loader' },
      { test: /\.scss$/, use: ['style-loader', 'css-loader?minimize', 'sass-loader'] },
      { test: /\.css$/, use: ['style-loader', 'css-loader?minimize&-url', 'remove-urlimport-loader'] },
    ]
  },
  plugins
}
