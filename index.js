/* jshint node: true */
var BasePlugin = require('ember-cli-deploy-plugin');
var Uploader = require('./lib/uploader');
var ApiClient = require('./lib/api-client');
var RSVP = require('rsvp');

module.exports = {
  name: 'ember-cli-deploy-rest-api',

  createDeployPlugin: function(options) {
    var DeployPlugin = BasePlugin.extend({
      name: options.name,

      defaultConfig: {
        distDir: function(context) {
          return context.distDir;
        },
        distFiles: function(context) {
          return context.distFiles || [];
        },
      },
      requiredConfig: ['baseUrl', 'assetKey'],

      prepare: function(context) {
        var revision = getRevision(context);
        if(!revision) {
          return new RSVP.Promise(function(_, reject) {
            reject('No revision key found in deploy context.');
          });
        }
      },

      upload: function(context) {
        var that = this;
        var revision = getRevision(context);
        var distDir = this.readConfig('distDir');
        var distFiles = this.readConfig('distFiles');
        var i = distFiles.indexOf('index.html');
        this.log('Uploading index.html…');
        if(i < 0) {
          return new RSVP.Promise(function(_, reject) {
            reject('No file index.html found.');
          });
        }
        var file = distFiles[i];
        var uploader = new Uploader(clientConfig.call(this));
        return new RSVP.Promise(function(resolve, reject) {
          uploader.uploadFile(distDir + '/' + file, revision).then(function() {
            that.log('Done uploading index.html.');
            resolve();
          }, function(error) {
            reject('Error uploading index.html: ' + error);
          });
        });
      },

      activate: function(context) {
        var revision = getRevision(context);
        var client = new ApiClient(clientConfig.call(this));
        return client.activate(revision);
      }
    });

    return new DeployPlugin();

    function getRevision(context) {
      return context.revisionData && context.revisionData.revisionKey;
    }

    function clientConfig() {
      return {
        authHeader: this.readConfig('authHeader'),
        baseUrl: this.readConfig('baseUrl'),
        assetKey: this.readConfig('assetKey')
      };
    }
  }
};
