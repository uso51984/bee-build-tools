const assign = require('object-assign');
const getBabelConfig = require('../config/getBabelConfig');
const replaceLib = require('../util/replaceLib');

const getLoaders = (c) {
  const isCommonjs = c || false;
  const babelConfig = getBabelConfig(isCommonjs);
  if (isCommonjs === false) {
    babelConfig.plugins.push(replaceLib);
  }
  const babelLoader = {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    loader: 'babel',
    options: babelConfig,
  };
  const svgLoader = {
    test: /\.svg$/,
    loader: 'svg-sprite',
  }
  const imageLoader = {
    test: /\.(png|jpg|jpeg|webp)$/i,
    loader: 'file',
  }
  const markdownLoader = {
    test: /\.md/,
    use: ['raw-loader'],
  }
  return [
    babelLoader,
    svgLoader,
    imageLoader,
    markdownLoader
    {
      test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'url',
      options: {
        limit: 10000,
        minetype: 'application/font-woff',
      },
    },
    {
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'url',
      options: {
        limit: 10000,
        minetype: 'application/octet-stream',
      },
    },
    {
      test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'file',
    }
  ];
}