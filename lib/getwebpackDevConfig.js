
'use strict';

const path = require('path');
const resolveCwd = require('./resolveCwd');
const fs = require('fs-extra');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const getWebpackCommonConfig = require('./getWebpackCommonConfig');

function getEntry() {
  const exampleDir = resolveCwd('examples');
  const files = fs.readdirSync(exampleDir);
  const entry = {};
  files.forEach(file => {
    const extname = path.extname(file);
    const name = path.basename(file, extname);
    if (extname === '.js' || extname === '.jsx' || extname === '.tsx' || extname === '.ts') {
      entry[`examples/${name}`] = [`./examples/${file}`];
    }
  });
  console.log('entr2323y', entry);
  return entry;
}

const ProgressBarPlugin = require('progress-bar-webpack-plugin');

module.exports = ({ common, inlineSourceMap }) => {
  const plugins = [new ProgressBarPlugin()];
  plugins.push(
    new HtmlWebpackPlugin({
      title: 'demo',
      template: './examples/index.html',
      filename: 'index.html',
    })
  );

  return {
    devtool: inlineSourceMap ? '#inline-source-map' : '#source-map',

    resolveLoader: getWebpackCommonConfig.getResolveLoader(),

    entry: getEntry(),

    output: {
      path: resolveCwd('build'),
      filename: '[name].js',
    },

    module: {
      noParse: [/moment.js/],
      rules: getWebpackCommonConfig.getLoaders().concat(getWebpackCommonConfig.getCssLoaders(false)),
    },

    resolve: getWebpackCommonConfig.getResolve(),

    plugins,
    mode: 'development',
    devServer: {
      host: '0.0.0.0',
      port: 9700,
      open: true,
      compress: true,
      historyApiFallback: true,
      hot: false,
      publicPath: '/',
      quiet: false,
      lazy: false
    }
  };
};