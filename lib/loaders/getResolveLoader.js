const path = require('path');

function getResolve() {
  console.log('process.cwd()', `${process.cwd()}/src`)

  const resolve = {
    modules: [`${process.cwd()}/src`, 'node_modules'],
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