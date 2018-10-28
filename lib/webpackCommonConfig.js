'use strict';
const path = require('path');
const fs = require('fs');
const resolveCwd = require('./resolveCwd');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const getBabelCommonConfig = require('./getBabelCommonConfig');
const assign = require('object-assign');
const pkg = require(resolveCwd('package.json'));
const cwd = process.cwd();

function getResolve() {
  const alias = {};
  const resolve = {
    modules: [cwd, 'node_modules'],
    extensions: ['.js', '.jsx'],
    alias,
  };

  const { name } = pkg;

  let pkgSrcMain = resolveCwd('index.js')
  let pkgSrcMain = resolveCwd('index.js');
  if (!fs.existsSync(pkgSrcMain)) {
    pkgSrcMain = resolveCwd('src/index.js');
    if (!fs.existsSync(pkgSrcMain)) {
      console.error('Get webpack.resolve.alias error: no /index.js or /src/index.js exist !!');
    }
  }

  // resolve import { foo } from 'rc-component'
  // to 'rc-component/index.js' or 'rc-component/src/index.js'
  alias[`${name}$`] = pkgSrcMain;

  // resolve import foo from 'rc-component/lib/foo' to 'rc-component/src/foo.js'
  alias[`${name}/lib`] = resolveCwd('./src');
  alias[`${name}/${constants.tsCompiledDir}`] = cwd;

  alias[name] = cwd;
  return resolve;
}

const postcssLoder = {
  loader: 'postcss',
  option: { plugins: require('./postcssConfig') }
}

module.exports = {
  getResolve,
  getResolveLoader() {
    return {
      modules: [
        path.resolve(__dirname, '../node_modules'),
        path.resolve(__dirname, '../../')
      ],
      moduleExtensions: ['-loader']
    }
  },
  getLoaders(c) {
    const commonjs = c || false;
    const babelConfig = getBabelCommonConfig(commonjs);
    if (commonjs === false) {
      babelConfig.plugins.push(replaceLib);
    }

    const babelLoader = {
      loader: 'babel',
      opions: babelConfig,
    };

    return [
      assign({
        test: /\.jsx?$/,
        exclude: /node_modules/,
      },
      babelLoader
      ),
      {
        test: /\.svg$/,
        loader: 'svg-sprite'
      },
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
      },
      {
        test: /\.(png|jpg|jpeg|webp)$/i,
        loader: 'file',
      },
    ]
  },
  getCssLoaders(extractCss) {
    let cssLoader = [
      {
        loader: 'css',
        options: {
          importLoaders: 1,
          sourceMap: true,
        }
      },
      postcssLoder,
      {
        loader: 'less',
        options: {
          sourceMap: true,
        }
      }
    ];

    if (extractCss) {
      cssLoader = ExtractTextPlugin.extract({
        fallback: 'style-loader',
        user: cssLoader
      })
    } else {
      const styleLoader = {
        loader: 'style',
      };
      cssLoader.unshift(styleLoader);
    }

    return [
      {
        test: /\.css$/,
        use: cssLoader,
      },
      {
        test: /\.less$/,
        use: lessLoader
      }
    ]
  }
}