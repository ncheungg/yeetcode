'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      'not-in-room': PATHS.src + '/popup/not-in-room.ts',
      'content-script': PATHS.src + '/content-scripts/content-script.ts',
      background: PATHS.src + '/background/background.ts',
      sidebar: PATHS.src + '/sidebar.ts',
      'userid-script': PATHS.src + '/content-scripts/userid-script.ts',
      'not-logged-in': PATHS.src + '/popup/not-logged-in.ts',
      'sidebar-script': PATHS.src + '/content-scripts/sidebar-script.ts',
      popup: PATHS.src + '/popup/popup.css',
    },
    devtool: argv.mode === 'production' ? false : 'source-map',
  });

module.exports = config;
