
'use strict';

const path = require('path');
const resolveCwd = require('./util/resolveCwd');
const fs = require('fs-extra');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const pkg = require(resolveCwd('package.json'));
const getCssLoaders = require('./loaders/getCssLoaders');
const getBaseLoaders = require('./loaders/getBaseLoaders');
const { getResolveLoader, getResolve } = require('./loaders/getResolveLoader');

const plugins = [new ProgressBarPlugin()];

function setHtmlWebpackPlugin(name) {
  const htmlTemplatePath = pkg.config && pkg.config.examples && pkg.config.examples.htmlTemplatePath
  plugins.push(
    new HtmlWebpackPlugin({
      chunks: [name],
      title: name,
      template: htmlTemplatePath || './examples/index.html',
      filename: `${name}.html`,
      inject: true
    })
  );
}

function getEntry() {
  const entry = pkg.config && pkg.config.demo && pkg.config.demo.entry;
  if (entry) {
    for (let key in entry) {
      setHtmlWebpackPlugin(key)
    }
    return entry;
  }
  const exampleDir = resolveCwd('examples');
  const files = fs.readdirSync(exampleDir);
  const defaultEntry = {};
  files.forEach(file => {
    const extname = path.extname(file);
    const name = path.basename(file, extname);
    if (extname === '.js' || extname === '.jsx' || extname === '.tsx' || extname === '.ts') {
      if (name === 'index' || name === 'mobile') {
        defaultEntry[name] = [`./examples/${file}`];
        setHtmlWebpackPlugin(name);
      }
    }
  });
  return defaultEntry;
}

module.exports = ({ common, inlineSourceMap }) => {


  return {
    devtool: inlineSourceMap ? '#inline-source-map' : '#source-map',

    resolveLoader: getResolveLoader(),

    entry: getEntry(),

    output: {
      path: resolveCwd('build'),
      filename: '[name].js',
    },

    module: {
      noParse: [/moment.js/],
      rules: getBaseLoaders().concat(getCssLoaders(false)),
    },

    resolve: getResolve(),

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