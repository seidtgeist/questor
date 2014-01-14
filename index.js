'use strict';

var assign = require('lodash.assign');
var defaults = require('lodash.defaults');
var bl = require('bl');
var http = require('http');
var https = require('https');
var Promise = require('bluebird');
var url = require('url');

module.exports = questor;
function questor(uri, options) {
  if (!options) { options = {}; }

  options = defaults({}, options, url.parse(uri), {
    headers: {}
  });

  var requestBody = options.body ? new Buffer(options.body) : void 0;
  var requestBodyLength = options.body ? requestBody.length : 0;
  options.headers['content-length'] = requestBodyLength;
  var driver = options.protocol === 'http:' ? http : https;
  var resolver = Promise.pending();
  var request = driver.request(options, function(response) {
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
        resolver.reject(assign(new Promise.RejectionError(value.body), value));
        return;
      }

      resolver.fulfill(value);
    }));
  });

  request.on('error', resolver.reject.bind(resolver));

  request.end(requestBody);

  return resolver.promise;
}
