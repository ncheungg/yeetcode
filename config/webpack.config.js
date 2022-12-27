'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      sidebar: PATHS.src + '/sidebar.ts',
      background: PATHS.src + '/background/background.ts',
      'content-script': PATHS.src + '/content-scripts/content-script.ts',
      'userid-script': PATHS.src + '/content-scripts/userid-script.ts',
      'sidebar-script': PATHS.src + '/content-scripts/sidebar-script.ts',
      'join-room-script': PATHS.src + '/content-scripts/join-room-script.ts',
      'not-logged-in': PATHS.src + '/popup/not-logged-in.ts',
      'not-in-room': PATHS.src + '/popup/not-in-room.ts',
      'in-room': PATHS.src + '/popup/in-room.ts',
      popup: PATHS.src + '/popup/popup.css',
    },
    devtool: argv.mode === 'production' ? false : 'source-map',
  });

module.exports = config;
