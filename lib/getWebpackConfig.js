'use strict';

const path = require('path');
const resolveCwd = require('././util/resolveCwd');
const fs = require('fs-extra');
const getCssLoaders = require('./loaders/getCssLoaders');
const getBaseLoaders = require('./loaders/getBaseLoaders');
const { getResolveLoader, getResolve } = require('./loaders/getResolveLoader');

function getEntry() {
  const exampleDir = resolveCwd('examples');
  const files = fs.readdirSync(exampleDir);
  const entry = {};
  files.forEach(file => {
    const extname = path.extname(file);
    const name = path.basename(file, extname);
    if (extname === '.js' || extname === '.jsx' || extname === '.tsx' || extname === '.ts') {
      const htmlFile = path.join(exampleDir, `${name}.html`);
      if (fs.existsSync(htmlFile)) {
        entry[`examples/${name}`] = [`./examples/${file}`];
      }
    }
  });
  return entry;
}

const ProgressBarPlugin = require('progress-bar-webpack-plugin');

module.exports = ({ common, inlineSourceMap }) => {
  const plugins = [new ProgressBarPlugin()];
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
