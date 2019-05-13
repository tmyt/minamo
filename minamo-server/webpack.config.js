'use strict';

const webpack = require('webpack')
    , path = require('path')
    , HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
    , config = require('./config')
    , SriPlugin = require('webpack-subresource-integrity')
    , UglifyEsPlugin = require('uglifyjs-webpack-plugin');

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
  new webpack.NormalModuleReplacementPlugin(/debug/, process.cwd() + '/src/noop.js'),
  new webpack.NormalModuleReplacementPlugin(/warning/, process.cwd() + '/src/noop.js'),
  new webpack.NormalModuleReplacementPlugin(/qs|parseqs|query-string|querystring-es3/, process.cwd() + '/node_modules/querystring'),
  new SriPlugin({
    hashFuncNames: ['sha256'],
    enabled: process.env.NODE_ENV === 'production'
  }),
];

if(process.env.NODE_ENV === 'production'){
  plugins.push(new UglifyEsPlugin({
    parallel: true,
  }));
}

module.exports = {
  entry: {
    bundle: './src/client.js',
    styles: './src/styles.js',
    loader: './src/loader.js',
  },
  output: {
    path: path.resolve('./public'),
    filename: '[name].js',
    chunkFilename: '[id].[hash].bundle.js',
    publicPath: config.cdn ? `//${config.cdn}/` : '/',
    crossOriginLoading: 'anonymous',
  },
  externals: {
    'json3': 'JSON'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['@babel/react'],
            plugins: ['@babel/plugin-proposal-object-rest-spread', '@babel/plugin-syntax-dynamic-import'],
            babelrc: false,
          }
        }]
      },
      { test: /json3\.js/, use: 'imports-loader?define=>false' },
      { test: /\.scss$/, use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'] },
      { test: /\.css$/, use: ['style-loader', 'css-loader?-url', 'postcss-loader', 'remove-urlimport-loader'] },
    ]
  },
  devtool: '#inline-source-map',
  plugins
};
