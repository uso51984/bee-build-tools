'use strict';

const autoprefixer = require('autoprefixer');

  const autoprefixerConfig = autoprefixer({
    remove: false,
  });


module.exports = function() {
  return [autoprefixerConfig];
};
