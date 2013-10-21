'use strict';

var _ = require('underscore-contrib');
var bl = require('bl');
var http = require('http');
var https = require('https');
var url = require('url');
var Promise = require('pacta').Promise;

module.exports = questor;
function questor(uri, options) {
  if (!options) { options = {}; }
  var optionsWithURI = _.extend({}, url.parse(uri), options);
  var driver = optionsWithURI.protocol === 'http:' ? http : https;
  var promise = new Promise();
  var request = driver.request(optionsWithURI, function(response) {
    response.pipe(bl(function(err, data) {
      var body = data.toString();
      var value = _.extend({
        responseText: body,
      }, _.pick(response, 'headers', 'statusCode'));

      if (response.statusCode === 0) {
        promise.reject(new Error('Network error'));
        return;
      }

      if (response.statusCode >= 300) {
        promise.reject(value);
        return;
      }

      promise.resolve(value);
    }));
  });

  request.on('error', _.bound(promise, 'reject'));

  request.setHeader('Content-Length', options.body ? options.body.length : 0);
  request.end(options.body);

  return promise;
}
