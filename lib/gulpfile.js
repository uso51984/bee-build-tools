'use strict';

const gulp = require('gulp');
const resolveCwd = require('./resolveCwd');
const through2 = require('through2');
const babel = require('gulp-babel');
const argv = require('minimist')(process.argv.slice(2));
const merge2 = require('merge2');
const rimraf = require('rimraf');
const postcss = require('gulp-postcss');
const replaceLib = require('./replaceLib');
const minify = require('gulp-babel-minify');
const getBabelCommonConfig = require('./getBabelCommonConfig');


const pkg = require(resolveCwd('package.json'));
const lessPath = new RegExp(`(["']${pkg.name})/assets/([^.'"]+).less`, 'g');
const src = argv.src || 'src';

function dist(done) {
  rimraf.sync(path.join(cwd, 'dist'));
  process.env.RUN_ENV = 'PRODUCTION';
  const webpackConfig = require(path.join(cwd, 'webpack.config.js'));
  webpack(webpackConfig, (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
      console.error(info.errors);
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }

    const buildInfo = stats.toString({
      colors: true,
      children: true,
      chunks: false,
      modules: false,
      chunkModules: false,
      hash: false,
      version: false,
    });
    console.log(buildInfo);
    done(0);
  });
}

function babelifyInternal(js, modules) {
  function replacer(match, m1, m2) {
    return `${m1}/assets/${m2}.css`;
  }

  const babelConfig = getBabelCommonConfig(modules);
  if (modules === false) {
    babelConfig.plugins.push(replaceLib);
  }

  let stream = js.pipe(babel(babelConfig));
  if (argv.compress) {
    stream = stream.pipe(minify());
  }
  return stream
    .pipe(
      through2.obj(function(file, encoding, next) {
        const contents = file.contents.toString(encoding).replace(lessPath, replacer);
        file.contents = Buffer.from(contents);
        this.push(file);
        next();
      })
    )
    .pipe(gulp.dest(modules !== false ? 'lib' : 'es'));
}

function babelify(modules) {

  const streams = [];
  const assets = gulp
    .src([`${src}/**/*.@(png|svg|less|d.ts)`])
    .pipe(gulp.dest(modules === false ? 'es' : 'lib'));
    streams.push(babelifyInternal(gulp.src([`${src}/**/*.js`, `${src}/**/*.jsx`]), modules));
  return merge2(streams.concat([assets]));
}

gulp.task('js', () => {
  return babelify();
});

gulp.task('es', ['js'], () => {
  return babelify(false);
});

gulp.task('compile', ['es', 'css']);

gulp.task('css', () => {
  const less = require('gulp-less');
  return gulp
    .src('assets/*.less')
    .pipe(less())
    .pipe(postcss([require('./getAutoprefixer')()]))
    .pipe(gulp.dest('assets'));
});

gulp.task('dist', (done) => {
  dist(done);
});