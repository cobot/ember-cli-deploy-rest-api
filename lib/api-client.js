/* jshint node: true */
var extend = require('util')._extend;
var RSVP    = require('rsvp');
var request = require('request');

module.exports = function(options) {
  var baseUrl = options.baseUrl;
  var assetKey = options.assetKey;
  var requestOptions = {
    headers: {Authorization: options.authHeader},
    followAllRedirects: true,
    json: true,
  };
  var responseHandler = function(resolve, reject) {
    return function(error, response, body) {
      if(error) {
        reject(error);
      } else if(String(response.statusCode).substr(0, 1) !== '2') {
        reject(body);
      } else {
        resolve();
      }
    };
  };

  this.add = function(versionKey, value) {
    return new RSVP.Promise(function(resolve, reject) {
      request
        .put(extend(requestOptions, {
          url: baseUrl + assetKey + '/revisions/' + versionKey,
          body: {value: value}
        }), responseHandler(resolve, reject));
    });
  };
  this.activate = function(version) {
    return new RSVP.Promise(function(resolve, reject) {
      request
        .put(extend(requestOptions, {
          url: baseUrl + assetKey,
          body: {revision: version}
        }), responseHandler(resolve, reject));
    });
  };
};
