/* eslint-env node */

/**
 * This config can be used to deploy production and development
 * assets to S3. Production assets will be used together with the
 * Cobot main app's assets api for production use.
 * Development deployments are used for running Ember apps in development
 * on local dev machines withou having to run the Ember dev server
 * locally. They are loaded via extra code in the LoadAsset module
 * of the main app, which parses index.html on S3.
 *
 * @param {'development'|'production'} deployTarget where to deploy to
 * @param {string} assetKey the key/id of the Asset within the Cobot main app/asset API
 * @param {string} prefix the filename prefix (aka parent directory) for S3
 * @returns {object} the deployment config
 */
 module.exports = function (deployTarget, assetKey, prefix) {
  'use strict';
  const isProduction = deployTarget === 'production';

  var ENV = {
    pipeline: {
      activateOnDeploy: true,
      runOrder: {
        build: { before: 'gzip' },
        gzip: { before: 'revision-data' },
        'revision-data': { before: 's3' },
      },
    },
    build: {
      environment: deployTarget,
    },
  };

  if (isProduction) {
    // for production we want to notify cobot...
    ENV.pipeline.runOrder['rest-api'] = { after: 's3' };
    ENV['rest-api'] = {
      authHeader: 'Token ' + process.env['ASSET_API_TOKEN'],
      baseUrl: 'https://www.cobot.me/api/assets/',
      assetKey: assetKey,
    };
    // ...and not create an index.html
    ENV.pipeline.disabled = {
      's3-index': true,
    };
  } else {
    // for development, cobot should not be notified but
    // an index.html should be generated
    ENV.pipeline.disabled = {
      'rest-api': true,
    };
    // development deployments don't go in the same directoy
    // as production ones.
    prefix = `development/${prefix}`;
  }
  ENV.s3 = {
    accessKeyId: process.env['AWS_ACCESS_KEY'],
    secretAccessKey: process.env['AWS_SECRET_KEY'],
    bucket: process.env['AWS_BUCKET'],
    prefix: prefix,
    region: 'us-east-1',
  };
  // the s3-index readme warns about sharing configs, see
  // https://github.com/ember-cli-deploy/ember-cli-deploy-s3-index#configuration-options
  ENV['s3-index'] = Object.assign({ allowOverwrite: true }, ENV.s3);

  return ENV;
};
