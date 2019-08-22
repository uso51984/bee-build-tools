
'use strict';
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const resolveCwd = require('./util/resolveCwd');
const getCssLoaders = require('./loaders/getCssLoaders');
const getBaseLoaders = require('./loaders/getBaseLoaders');
const { getResolveLoader, getResolve } = require('./loaders/getResolveLoader');
const ProgressBarPlugin = require('./config/getProgressBarPlugin');
const { entry, htmlWebpackPluginList} = require('./config/getEntry')();

const pkg = require(resolveCwd('package.json'));
const server = pkg.config.server || {};

const plugins = [ProgressBarPlugin].concat(htmlWebpackPluginList,new MiniCssExtractPlugin({
  filename: '[name].[contenthash:8].css',
  chunkFilename: '[id].[contenthash:8].css',
}));

const port = server.port || 9700;
const host = server.host || 'localhost';

module.exports = {
    devtool: '#source-map',
    resolveLoader: getResolveLoader(),
    entry: entry,
    output: {
      path: resolveCwd('build'),
      filename: '[name].[contenthash:8].js',
    },
    module: {
      noParse: [/moment.js/],
      rules: getBaseLoaders().concat(getCssLoaders(true)),
    },
    resolve: getResolve(),
    plugins,
    mode: 'development',
    optimization: {
      splitChunks: {
        chunks: 'all',
        name: true,
      },
    },
    devServer: {
      host,
      port,
      open: true,
      compress: true,
      historyApiFallback: true,
      hot: false,
      publicPath: '/',
      quiet: false,
      lazy: false
    }
};