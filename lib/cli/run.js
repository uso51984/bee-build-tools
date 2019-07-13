#!/usr/bin/env node

require('colorful').colorful();
const program = require('commander');

program.on('--help', () => {
  console.log('  Usage:'.to.bold.blue.color);
  console.log();
  console.log('    $', 'bee-tools run lint'.to.magenta.color, 'lint source within lib');
  console.log('    $', 'bee-tools run pub'.to.magenta.color, 'publish component');
  console.log('    $', 'bee-tools run server'.to.magenta.color, 'start server');
  console.log('    $', 'bee-tools run chrome-test'.to.magenta.color, 'run chrome tests');
  console.log();
});

program.parse(process.argv);

const task = program.args[0];

if (!task) {
  program.help();
} else {
  const gulp = require('gulp');
  require('../gulpfile');
  gulp.start(task);
}
