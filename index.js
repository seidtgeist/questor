'use strict';

var _ = require('underscore-contrib');
var bl = require('bl');
var http = require('http');
var https = require('https');
var Promise = require('bluebird');
var url = require('url');

module.exports = questor;
function questor(uri, options) {
  if (!options) { options = {}; }
  var optionsWithURI = _.extend({}, url.parse(uri), options);
  var driver = optionsWithURI.protocol === 'http:' ? http : https;
  var resolver = Promise.pending();
  var request = driver.request(optionsWithURI, function(response) {
    response.pipe(bl(function(err, data) {
      var body = data.toString();
      var value = {
        body: body,
        headers: response.headers,
        status: response.statusCode
      };

      if (response.statusCode === 0) {
        resolver.reject(new Error('Network error'));
        return;
      }

      if (response.statusCode >= 300) {
        resolver.reject(_.extend(new Error(value.body), value));
        return;
      }

      resolver.fulfill(value);
    }));
  });

  request.on('error', _.bound(resolver, 'reject'));

  request.setHeader('Content-Length', options.body ? new Buffer(options.body).length : 0);
  request.end(options.body);

  return resolver.promise;
}
