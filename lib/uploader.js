/* jshint node: true */

var fs = require('fs');
var ApiClient = require('./api-client');

module.exports = function Uploader(config) {
  'use strict';
  var baseUrl = config.baseUrl;
  var authHeader = config.authHeader;
  var assetKey = config.assetKey;
  var client = new ApiClient({authHeader: authHeader, baseUrl: baseUrl, assetKey: assetKey});

  this.uploadFile = function(file, revision) {
    return client.add(revision, fs.readFileSync(file, 'utf8'));
  };
};
