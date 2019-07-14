const path = require('path');

function getResolve() {
  const resolve = {
    modules: [process.cwd(), 'node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  };

  return resolve;
}

function getResolveLoader() {
  return {
    modules: [
      path.resolve(__dirname, '../../node_modules'),
      path.resolve(__dirname, '../../../'),
    ],
    moduleExtensions: ['-loader'],
  };
};

module.exports = {
  getResolve,
  getResolveLoader
}