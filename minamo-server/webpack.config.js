'use strict';

const webpack = require('webpack')
    , path = require('path')
    , HardSourceWebpackPlugin = require('hard-source-webpack-plugin')

let plugins = [
  new HardSourceWebpackPlugin({
    cacheDirectory: path.join(process.cwd(), '.cache/webpack/[confighash]'),
    recordsPath: path.join(process.cwd(), '.cache/webpack/[confighash]/records.json'),
    configHash: webpackConfig => require('node-object-hash')().hash(webpackConfig),
    environmentHash: {
      root: process.cwd(),
      directories: ['node_modules'],
      files: ['package.json'],
    },
  }),
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
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: { warnings: false },
    mangle: true
  }));
}

module.exports = {
  entry: {
    bundle: './src/client.js',
    styles: './src/styles.js',
    loader: './src/loader.js',
  },
  output: {
    path: './public',
    filename: '[name].js',
    chunkFilename: '[id].[hash].bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [['modern-browsers', {fullSupport: true, modules: false}], 'react'],
            plugins: ['transform-runtime'],
            babelrc: false,
          }
        }]
      },
      { test: /\.scss$/, use: ['style-loader', 'css-loader?minimize', 'sass-loader'] },
      { test: /\.css$/, use: ['style-loader', 'css-loader?minimize&-url', 'remove-urlimport-loader'] },
    ]
  },
  plugins
}
