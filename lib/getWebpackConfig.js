const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const getWebpackCommonConfig = require('./getWebpackCommonConfig');
const resolveCwd = require('./resolveCwd');


module.exports = ({ common, inlineSourceMap }) => {
  const plugins = [new ProgressBarPlugin()];
  plugins.push(
    new ExtractTextPlugin({
      filename: '[name].css',
      disable: false,
      allChunks: true,
    })
  );
  if (common) {
    plugins.push(
      new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        filename: 'common.js'
      })
    )
  }
  return {
    devtool: inlineSourceMap ? '#inline-source-map' : '#source-map',
    resolveLoader: getWebpackCommonConfig.getResolveLoader(),
    entry: './index',
    output: {
      path: resolveCwd('build'),
      filename: '[name].js',
    },

    module: {
      noParse: [/moment.js/],
      rules: getWebpackCommonConfig.getLoaders().concat(getWebpackCommonConfig.getCssLoaders(true)),
    },

    resolve: getWebpackCommonConfig.getResolve(),

    plugins,
  }
}