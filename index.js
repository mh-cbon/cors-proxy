
var pkg     = require('./package.json')
var debug   = require('debug')(pkg.name)

var corsProxy = function (options) {

  var http  = require('http');
  var https = require('https');
  var url   = require('url');


  if (!options.source) throw 'Missing source option';
  if (!options.bind) throw 'Missing bind option';
  debug('options %j', options);
  debug('server will listen at %s', options.bind);

  var parsedBind    = url.parse(options.bind);
  var parsedSource  = url.parse(options.source);

  parsedBind.host     = parsedBind.host==='*' ? null : parsedBind.host;
  parsedBind.port     = parsedBind.port ? parsedBind.port : 80;
  parsedSource.port   = parsedSource.port ? parsedSource.port : 80;

  var server = (parsedBind.protocol==='http:'?http:https).createServer(onRequest);
  server.on('error', console.error.bind(console))

  process.nextTick(function () {
    server.listen(parsedBind.port, parsedBind.hostname);
  })

  function onRequest(req, res) {
    debug('got request %s %s', req.url, req.method);
    debug('headers %j', req.headers);

    // if it s a pre-flighted requests,
    // we bypass the source and answer immediately.
    if (req.method.match(/options/i)) {

      // @todo check incoming headers against options,
      // if not valid, respond 500 ? Something like this...
      // Access-Control-Request-Method
      //    Used when issuing a preflight request to let the server know what HTTP method will be used when the actual request is made.
      // Access-Control-Request-Headers
      //    Used when issuing a preflight request to let the server know what HTTP headers will be used when the actual request is made.

      // assign the whole CORS headers
      var headers = {}
      if (options.origin) {
        if (options.origin===true) {
          headers['Access-Control-Allow-Origin'] = req.headers.origin;
        } else {
          headers['Access-Control-Allow-Origin'] = options.origin;
        }
      }
      if (options.credentials)
        headers['Access-Control-Allow-Credentials'] = 'true'
      if (options.methods)
        headers['Access-Control-Allow-Methods'] = options.methods
      if (options.headers)
        headers['Access-Control-Allow-Headers'] = options.headers
      if (options.exposed)
        headers['Access-Control-Expose-Headers'] = options.exposed
      if (options.maxage)
        headers['Access-Control-Max-Age'] = options.maxage

      debug('OPTIONS res headers %j', headers);
      res.writeHead(200, headers);
      return res.end();
    }

    // create request to the proxy,
    // copy client method, headers onto it.
    var proxyReqOtions = {
      method:     req.method,
      hostname:   parsedSource.hostname,
      port:       parsedSource.port,
      path:       req.url,
      headers:    JSON.parse(JSON.stringify(req.headers)),
    };

    // fix host header of the requets to the proxy.
    proxyReqOtions.headers['host'] = parsedSource.hostname + ':' + parsedSource.port;

    // add X-forwarded info
    if (!proxyReqOtions.headers['X-Forwarded-For']) proxyReqOtions.headers['X-Forwarded-For'] = '';
    proxyReqOtions.headers['X-Forwarded-For'] += ', ' + req.connection.remoteAddress;

    if (!proxyReqOtions.headers['X-Forwarded-Proto'])
      proxyReqOtions.headers['X-Forwarded-Proto'] = req.connection.encrypted ? 'https' : 'http';

    if (!proxyReqOtions.headers['X-Forwarded-Port'])
      proxyReqOtions.headers['X-Forwarded-Port'] = req.connection.encrypted ? '443' : '80';

    if (!proxyReqOtions.headers['X-Forwarded-Host'])
      proxyReqOtions.headers['X-Forwarded-Host'] = req.headers['host'];

    debug('proxyReqOtions %j', proxyReqOtions);
    // create the request to the proxy
    var proxyfiedReq = http.request(proxyReqOtions);
    // write client request to the proxy
    req.pipe(proxyfiedReq);
    // some logs
    proxyfiedReq.on('error', console.error.bind(console));
    // notify client request
    proxyfiedReq.on('error', function (err){
      res.writeHead(err.statusCode, {'Content-type': 'text/plain'});
      res.end(err.toString());
    })
    // write proxy response onto client response
    proxyfiedReq.on('response', function(proxifiedRes) {
      var headers = JSON.parse(JSON.stringify(proxifiedRes.headers));
      if (options.origin) {
        if (options.origin===true) {
          headers['Access-Control-Allow-Origin'] = req.headers.origin;
        } else {
          headers['Access-Control-Allow-Origin'] = options.origin;
        }
      }
      if (options.credentials)
        headers['Access-Control-Allow-Credentials'] = 'true'
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Access-Control-Allow-Methods
      // says to be for preflighte request, but lets keep it here until further check is done.
      if (options.methods)
        headers['Access-Control-Allow-Methods'] = options.methods;
      if (options.exposed)
        headers['Access-Control-Expose-Headers'] = options.exposed;

      res.writeHead(proxifiedRes.statusCode, headers);
      proxifiedRes.pipe(res);
    })
  }

  return server;
}

module.exports = corsProxy;
