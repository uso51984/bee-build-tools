
'use strict';

const path = require('path');
const resolveCwd = require('./util/resolveCwd');
const fs = require('fs-extra');
const getCssLoaders = require('./loaders/getCssLoaders');
const getBaseLoaders = require('./loaders/getBaseLoaders');
const { getResolveLoader, getResolve } = require('./loaders/getResolveLoader');
const setHtmlWebpackPlugin  = require('./config/setHtmlWebpackPlugin');
const ProgressBarPlugin = require('./config/getProgressBarPlugin');


const pkg = require(resolveCwd('package.json'));
const server = pkg.config.server || {};
1
const plugins = [ProgressBarPlugin];

function getEntry() {
  const entry = server.entry;
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
  const port = server.port || 9700;
  const host = server.host || 'localhost';

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
};