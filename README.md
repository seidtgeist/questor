# The standard gods have spoken and you should use https://www.npmjs.com/package/isomorphic-fetch instead ¯\_(ツ)_/¯

## questor

Promise based HTTP client inspired by clj-http

## Usage

```javascript
var questor = require('questor');

questor('https://github.com').then(function (res) {
  // Request was successful
  
  console.log(res.body); // Contains the response body
  console.log(res.headers); // Contains the response headers
  console.log(res.status); // Contains the response status code
}, function (err) {
  // Request failed
  console.log(err);
});
```

## TODO

- Small resulting browserify bundle
- Streaming request and response bodies
- Types for requests, responses and errors
