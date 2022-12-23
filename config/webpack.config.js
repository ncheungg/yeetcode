'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      popup: PATHS.src + '/popup.ts',
      'content-script': PATHS.src + '/content-script.ts',
      background: PATHS.src + '/background.ts',
      sidebar: PATHS.src + '/sidebar.ts',
      'userid-script': PATHS.src + '/userid-script.ts',
    },
    devtool: argv.mode === 'production' ? false : 'source-map',
  });

module.exports = config;
