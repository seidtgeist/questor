'use strict';

var _ = require('underscore-contrib');
var bl = require('bl');
var hyperquest = require('hyperquest');
var Promise = require('pacta').Promise;

module.exports = questor;
function questor(uri, options) {
  var promise = new Promise();
  var request = hyperquest(uri, options, function(err, response) {
    if (err) {
      promise.reject(err);
      return;
    }

    request.pipe(bl(function(err, data) {
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

  return promise;
}
