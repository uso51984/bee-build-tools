const getBabelConfig = require('../config/getBabelConfig');
const replaceLib = require('../util/replaceLib');

const getLoaders = function(c) {
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


  const urlLodaer = {
    test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
    loader: 'url-loader',
    options: {
      limit: 10000,
      name: '[path][name].[hash:8].[ext]',
    },
  }

  const markdownLoader = {
    test: /\.md/,
    use: ['raw-loader'],
  }
  return [
    babelLoader,
    svgLoader,
    markdownLoader,
    urlLodaer,
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

module.exports = getLoaders;