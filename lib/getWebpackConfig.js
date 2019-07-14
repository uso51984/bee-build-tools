'use strict';

const resolveCwd = require('././util/resolveCwd');
const getCssLoaders = require('./loaders/getCssLoaders');
const getBaseLoaders = require('./loaders/getBaseLoaders');
const { getResolveLoader, getResolve } = require('./loaders/getResolveLoader');
const ProgressBarPlugin = require('./config/getProgressBarPlugin');
const getEntry = require('./config/getEntry');

module.exports = ({ common, inlineSourceMap }) => {
  const plugins = [ProgressBarPlugin];
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
      rules: getBaseLoaders().concat(getCssLoaders(true)),
    },
    resolve: getResolve(),
    plugins,
  };
};
