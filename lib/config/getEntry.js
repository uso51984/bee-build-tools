
'use strict';

const path = require('path');
const resolveCwd = require('./util/resolveCwd');
const fs = require('fs-extra');
const setHtmlWebpackPlugin  = require('./setHtmlWebpackPlugin');

const pkg = require(resolveCwd('package.json'));
const server = pkg.config.server || {};

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
      if (name === 'index' || name === 'app') {
        defaultEntry[name] = [`./examples/${file}`];
        setHtmlWebpackPlugin(name);
      }
    }
  });
  return defaultEntry;
}

module.exports = getEntry;