'use strict';

const gulp = require('gulp');
const path = require('path');
const resolveCwd = require('./resolveCwd');
const through2 = require('through2');
const webpack = require('webpack');
const shelljs = require('shelljs');
const getWebpackConfig = require('./getWebpackConfig');
const getwebpackDevConfig = require('./getwebpackDevConfig');
const babel = require('gulp-babel');
const { runCmd } = require('./util');
const fs = require('fs-extra');
const argv = require('minimist')(process.argv.slice(2));
const getBabelCommonConfig = require('./getBabelCommonConfig');
const postcss = require('gulp-postcss');
const chalk = require('chalk');
const { getNpmArgs } = require('./util');
const ts = require('gulp-typescript');
const merge2 = require('merge2');
const tsConfig = require('./getTSCommonConfig')();
const glob = require('glob');
const watch = require('gulp-watch');
const assign = require('object-assign');
const { tsCompiledDir } = require('./constants');
const { measureFileSizesBeforeBuild, printFileSizesAfterBuild } = require('./FileSizeReporter');
const replaceLib = require('./replaceLib');
const minify = require('gulp-babel-minify');
const prettier = require('gulp-plugin-prettier');

const pkg = require(resolveCwd('package.json'));
const cwd = process.cwd();
const lessPath = new RegExp(`(["']${pkg.name})/assets/([^.'"]+).less`, 'g');
const tsDefaultReporter = ts.reporter.defaultReporter();
const src = argv.src || 'src';

gulp.task('js-lint', ['check-deps'], done => {
  if (argv['js-lint'] === false) {
    return done();
  }
  const eslintBin = require.resolve('eslint/bin/eslint');
  let eslintConfig = path.join(__dirname, './eslintrc.js');
  const projectEslint = resolveCwd('./.eslintrc');
  if (fs.existsSync(projectEslint)) {
    eslintConfig = projectEslint;
  }
  const args = [eslintBin, '-c', eslintConfig, '--ext', '.js,.jsx', src, 'tests', 'examples'];
  if (argv.fix) {
    args.push('--fix');
  }
  runCmd('node', args, done);
});

gulp.task('ts-lint', ['check-deps'], done => {
  const tslintBin = require.resolve('tslint/bin/tslint');
  let tslintConfig = path.join(__dirname, './tslint.json');
  const projectTslint = resolveCwd('./tslint.json');
  if (fs.existsSync(projectTslint)) {
    tslintConfig = projectTslint;
  }
  const args = [
    tslintBin,
    '-c',
    tslintConfig,
    `${src}/**/*.tsx`,
    'tests/**/*.tsx',
    'examples/**/*.tsx',
  ];
  runCmd('node', args, done);
});

gulp.task('lint', ['ts-lint', 'js-lint']);

function printResult(stats) {
  if (stats.toJson) {
    stats = stats.toJson();
  }

  (stats.errors || []).forEach(err => {
    console.error('error', err);
  });

  stats.assets.forEach(item => {
    const size = `${(item.size / 1024.0).toFixed(2)}kB`;
    console.log('generated', item.name, size);
  });
}

function cleanCompile() {
  if (fs.existsSync(resolveCwd('lib'))) {
    shelljs.rm('-rf', resolveCwd('lib'));
  }
  if (fs.existsSync(resolveCwd('es'))) {
    shelljs.rm('-rf', resolveCwd('es'));
  }
  if (fs.existsSync(resolveCwd('assets'))) {
    shelljs.rm('-rf', resolveCwd('assets/*.css'));
  }
}

function cleanBuild() {
  if (fs.existsSync(resolveCwd('build'))) {
    shelljs.rm('-rf', resolveCwd('build'));
  }
}

function clean() {
  cleanCompile();
  cleanBuild();
}

gulp.task('webpack', ['cleanBuild'], done => {
  if (fs.existsSync(resolveCwd('./examples/'))) {
    webpack(
      getWebpackConfig({
        common: true,
      }),
      (err, stats) => {
        if (err) {
          console.error('error', err);
        }
        printResult(stats);
        done(err);
      }
    );
  } else {
    done();
  }
});

gulp.task('dist', done => {
  const entry = pkg.config && pkg.config.entry;
  if (!entry) {
    done();
    return;
  }
  let webpackConfig;
  const buildFolder = path.join(cwd, 'dist/');
  if (fs.existsSync(path.join(cwd, 'webpack.config.js'))) {
    webpackConfig = require(path.join(cwd, 'webpack.config.js'))(
      getWebpackConfig({
        common: false,
        inlineSourceMap: false,
      }),
      { phase: 'dist' }
    );
  } else {
    const output = pkg.config && pkg.config.output;
    if (output && output.library === null) {
      output.library = undefined;
    }
    webpackConfig = assign(
      getWebpackConfig({
        common: false,
        inlineSourceMap: false,
      }),
      {
        output: Object.assign(
          {
            path: buildFolder,
            filename: '[name].js',
            library: pkg.name,
            libraryTarget: 'umd',
            libraryExport: 'default',
          },
          output
        ),
        mode: 'development',
        externals: {
          react: {
            root: 'React',
            commonjs2: 'react',
            commonjs: 'react',
            amd: 'react',
          },
          'react-dom': {
            root: 'ReactDOM',
            commonjs2: 'react-dom',
            commonjs: 'react-dom',
            amd: 'react-dom',
          },
        },
      }
    );
    const compressedWebpackConfig = Object.assign({}, webpackConfig);
    compressedWebpackConfig.entry = {};
    compressedWebpackConfig.mode='production';

    Object.keys(entry).forEach(e => {
      compressedWebpackConfig.entry[`${e}.min`] = entry[e];
    });

    webpackConfig.entry = entry;
    webpackConfig = [webpackConfig, compressedWebpackConfig];
  }
  measureFileSizesBeforeBuild(buildFolder).then(previousFileSizes => {
    shelljs.rm('-rf', buildFolder);
    webpack(webpackConfig, (err, stats) => {
      if (err) {
        console.error('error', err);
      }
      stats.toJson().children.forEach(printResult);
      printFileSizesAfterBuild(stats, previousFileSizes, buildFolder);
      done(err);
    });
  });
});

gulp.task('clean', clean);

gulp.task('cleanCompile', cleanCompile);

gulp.task('cleanBuild', cleanBuild);


gulp.task('buildExample', done => {
  if (fs.existsSync(resolveCwd('./examples/'))) {
    webpack(
      getwebpackDevConfig({
        common: true,
      }),
      (err, stats) => {
        if (err) {
          console.error('error', err);
        }
        printResult(stats);
        done(err);
      }
    );
  } else {
    done();
  }
});


gulp.task('gh-pages', ['buildExample'], done => {
  console.log('gh-paging');
  if (pkg.scripts['pre-gh-pages']) {
    shelljs.exec('npm run pre-gh-pages');
  }
  if (fs.existsSync(resolveCwd('./examples/'))) {
    const ghPages = require('gh-pages');
    ghPages.publish(
      resolveCwd('build'),
      {
        depth: 1,
        logger(message) {
          console.log(message);
        },
      },
      () => {
        // cleanBuild();
        console.log('gh-paged');
        done();
      }
    );
  } else {
    done();
  }
});

gulp.task('css', ['cleanCompile'], () => {
  const less = require('gulp-less');
  return gulp
    .src('assets/*.less')
    .pipe(less())
    .pipe(postcss([require('./getAutoprefixer')()]))
    .pipe(gulp.dest('assets'));
});

gulp.task('pub', ['publish', 'gh-pages'], () => {
  console.log('tagging');
  const { version } = pkg;
  shelljs.cd(cwd);
  shelljs.exec(`git tag ${version}`);
  shelljs.exec(`git push origin ${version}:${version}`);
  shelljs.exec('git push origin master:master');
  console.log('tagged');
});

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
  if (glob.sync('src/**/*.{ts,tsx}').length && !glob.sync('src/**/*.d.ts').length) {
    let error = 0;
    let reporter = tsDefaultReporter;
    if (argv['single-run']) {
      reporter = {
        error(e) {
          tsDefaultReporter.error(e);
          error = e;
        },
        finish: tsDefaultReporter.finish,
      };
    }

    const tsResult = gulp
      .src([`${src}/**/*.ts`, `${src}/**/*.tsx`, 'typings/**/*.d.ts'])
      .pipe(ts(tsConfig, reporter));

    const check = () => {
      if (error) {
        // console.error('compile error', error);
        process.exit(1);
      }
    };
    tsResult.on('finish', check);
    tsResult.on('end', check);
    streams.push(tsResult.dts.pipe(gulp.dest(modules === false ? 'es' : 'lib')));
    streams.push(babelifyInternal(tsResult.js, modules));
  } else {
    streams.push(babelifyInternal(gulp.src([`${src}/**/*.js`, `${src}/**/*.jsx`]), modules));
  }
  return merge2(streams.concat([assets]));
}

gulp.task('js', ['cleanCompile'], () => {
  return babelify();
});

gulp.task('es', ['js'], () => {
  return babelify(false);
});

gulp.task('compile', ['es', 'css']);

gulp.task('check-deps', done => {
  if (argv['check-deps'] !== false) {
    require('./checkDep')(done);
  }
});

gulp.task('publish', ['compile', 'dist'], done => {
  if (!fs.existsSync(resolveCwd('lib')) || !fs.existsSync(resolveCwd('es'))) {
    return done('missing lib/es dir');
  }
  const npm = argv.tnpm ? 'tnpm' : 'npm';
  const beta = !pkg.version.match(/^\d+\.\d+\.\d+$/);
  let args = [npm, 'publish', '--with-rc-tools'];
  if (beta) {
    args = args.concat(['--tag', 'beta']);
  } else if (argv.tag) {
    args = args.concat(['--tag', argv.tag]);
  }
  if (pkg.scripts['pre-publish']) {
    shelljs.exec(`npm run pre-publish`);
  }
  let ret = shelljs.exec(args.join(' ')).code;
  cleanCompile();
  console.log('published');
  if (!ret) {
    ret = undefined;
  }
  done(ret);
});

gulp.task('compile_watch', ['compile'], () => {
  console.log('file changed');
  const outDir = argv['out-dir'];
  if (outDir) {
    fs.copySync(resolveCwd('lib'), path.join(outDir, 'lib'));
    fs.copySync(resolveCwd('es'), path.join(outDir, 'es'));
    if (fs.existsSync(resolveCwd('assets'))) {
      fs.copySync(resolveCwd('assets'), path.join(outDir, 'assets'));
    }
  }
});

gulp.task('watch', ['compile_watch'], () => {
  gulp.watch([`${src}/**/*.js?(x)`, `${src}/**/*.ts?(x)`, 'assets/**/*.less'], ['compile_watch']);
});

function compileTs(stream) {
  const assets = stream
    .pipe(
      through2.obj(function(file, encoding, next) {
        if (!file.path.endsWith('tsx')) {
          this.push(file);
        }
        next();
      })
    )
    .pipe(gulp.dest(path.join(cwd, tsCompiledDir)));

  return merge2([
    assets,
    stream
      .pipe(
        through2.obj(function(file, encoding, next) {
          if (file.path.endsWith('tsx')) {
            this.push(file);
          }
          next();
        })
      )
      .pipe(ts(tsConfig))
      .js.pipe(
        through2.obj(function(file, encoding, next) {
          // console.log(file.path, file.base);
          file.path = file.path.replace(/\.[jt]sx$/, '.js');
          this.push(file);
          next();
        })
      )
      .pipe(gulp.dest(path.join(cwd, tsCompiledDir))),
  ]);
}

const tsFiles = [
  `${src}/**/*.@(png|svg|less)`,
  `${src}/**/*.tsx`,
  'examples/**/*.tsx',
  'tests/**/*.tsx',
  'typings/**/*.d.ts',
];

gulp.task('watch-tsc', ['compile_tsc'], () => {
  watch(tsFiles, f => {
    if (f.event === 'unlink') {
      return;
    }
    const myPath = path.relative(cwd, f.path);
    compileTs(
      gulp.src([myPath, 'typings/**/*.d.ts'], {
        base: cwd,
      })
    );
  });
});

gulp.task('compile_tsc', () => {
  shelljs.rm('-rf', resolveCwd(tsCompiledDir));
  return compileTs(
    gulp.src(tsFiles, {
      base: cwd,
    })
  );
});

gulp.task('prettier', () => {
  return gulp
    .src(['./src/**/*.{js,jsx}', './tests/**/*.{js,jsx}', './examples/**/*.{js,jsx}'])
    .pipe(
      prettier.format(
        {
          printWidth: 100,
          useFlowParser: false,
          singleQuote: true,
          trailingComma: 'all',
        },
        {
          reporter: 'error',
        }
      )
    )
    .pipe(gulp.dest(file => file.base));
});
