
const HtmlWebpackPlugin = require('html-webpack-plugin');
const resolveCwd = require('./util/resolveCwd');
const pkg = require(resolveCwd('package.json'));


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