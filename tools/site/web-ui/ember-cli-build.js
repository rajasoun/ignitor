'use strict';

const crypto = require('crypto');
const randomString = require('randomstring').generate();
const git = require('git-rev-sync');
const prod = process.env.EMBER_ENV === 'production';
const customHash = crypto.createHash('md5').update(randomString).digest('hex');
const GlimmerApp = require('@glimmer/application-pipeline').GlimmerApp;

const version = git.short();

module.exports = function(defaults) {
  let app = new GlimmerApp(defaults, {
    'fingerprint': {
        enabled: prod,
        exclude: ['icon'],
        customHash,
      },
    'addons': {
        blacklist: prod ? [] : ['ember-service-worker'],
      },
    'esw-index': {
        location: 'index.html',
        excludeScope: [/\/localhost(\/.*)?$/],
        version,
      },
    'asset-cache': {
        include: [
          'assets/**/*',
          '**/*',
          'sw-registration.js',
          'sw.js'
        ],
        exclude: [
          '**/*.txt',
          '**/*.css',
          'test.json'
        ],
        version,
        requestMode: 'cors',
      },
    'esw-cache-fallback': {
        patterns: [
          '/',
          //'https://node-hnapi.herokuapp.com/(.+)',
        ],
        version,
      },
    'minifyJS': {
        enabled: prod,
        options: {
          mangle: true,
        },
      },
    'minifyCSS': {
        enabled: prod,
      },
    'inlineContent': {
      'critical-css': 'src/ui/styles/inline.css',
      },
    'minifyHTML': {
      enabled: prod,
      htmlFiles: ['index.html'],
      minifierOptions: {
        collapseWhitespace: true,
        removeComments: true,
        minifyJS: true,
        minifyCSS: true,
      },
    },
  });

return app.toTree();
};
