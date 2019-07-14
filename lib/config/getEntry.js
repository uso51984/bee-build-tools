
'use strict';

const path = require('path');
const fs = require('fs-extra');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const resolveCwd = require('../util/resolveCwd');
const pkg = require(resolveCwd('package.json'));
const server = pkg.config.server || {};

const htmlWebpackPluginList = []

function setHtmlWebpackPlugin(name) {
  const htmlTemplatePath = pkg.config && pkg.config.server && pkg.config.server.htmlTemplatePath
  htmlWebpackPluginList.push(
    new HtmlWebpackPlugin({
      chunks: [name],
      title: name,
      template: htmlTemplatePath || path.join(__dirname, './index.Template.html'),
      filename: `${name}.html`,
      inject: true
    })
  );
}

function getEntry() {
  const entry = server.entry;
  if (entry) {
    for (let key in entry) {
      setHtmlWebpackPlugin(key)
    }
    return {entry, htmlWebpackPluginList};
  }
  const exampleDir = resolveCwd('examples');
  const files = fs.readdirSync(exampleDir);
  const defaultEntry = {};
  files.forEach(file => {
    const extname = path.extname(file);
    const name = path.basename(file, extname);
    if (extname === '.js' || extname === '.jsx' || extname === '.tsx' || extname === '.ts') {
      if (name === 'index' || name === 'app') {
        defaultEntry[name] = [`./examples/${file}`];
        setHtmlWebpackPlugin(name);
      }
    }
  });
  return {entry: defaultEntry, htmlWebpackPluginList};
}

module.exports = getEntry;