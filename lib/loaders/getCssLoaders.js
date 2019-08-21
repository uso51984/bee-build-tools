const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const postcssLoader = {
  loader: 'postcss',
  options: { plugins: require('../config/postcssConfig') },
};

const styleLoader = {
  loader: 'style'
};

const cssLoader = [{
  loader: 'css',
  options: {
    importLoaders: 1,
    sourceMap: true,
  }},
  postcssLoader
];

const lessLoader = cssLoader.concat([{
  loader: 'less',
  options: {
    sourceMap: true,
  },
}])

const extractLodder = {
  loader: MiniCssExtractPlugin.loader,
  options: {
    // you can specify a publicPath here
    // by default it use publicPath in webpackOptions.output
  }
}

module.exports = (extractCss) => {
  if (extractCss) {
    cssLoader.unshift(extractLodder);
    lessLoader.unshift(extractLodder);
  } else {
    cssLoader.unshift(styleLoader);
    lessLoader.unshift(styleLoader);
  }
  return [
    {
      test: /\.css$/,
      use: cssLoader,
    },
    {
      test: /\.less$/,
      use: lessLoader,
    },
  ];
}