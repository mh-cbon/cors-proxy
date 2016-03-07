'use strict';

var expect = require('chai').expect,
  nock = require('nock'),
  http = require('http'),
  corsProxy = require('./index.js');

describe('cors-proxy', function () {

  describe('OPTIONS request', function () {
    var proxy;

    before(function (then) {
      nock('http://api.domain.com')
        .get('/').reply(200, 'data')
        .get('/qs').query({q: 's'}).reply(200, 'qs')
        ;
      proxy = corsProxy({
        source: 'http://api.domain.com',
        bind: 'http://127.0.0.1:8080/',
        origin: 'http://127.0.0.1:8090',
        credentials: true,
        methods: 'GET, POST',
        headers: 'X-what, X-ever',
        maxage: 600
      }).on('listening', then);
    });

    after(function (done) {
      nock.cleanAll();
      proxy.close(done);
    });

    it('should intercept OPTIONS requests per default', function (done) {
      http.request({ hostname: '127.0.0.1', port: 8080, method: 'OPTIONS' }, function (res) {
        expect(res.statusCode).to.be.eq(200);
        done();
      }).end();
    });

    it('should respond with allow origin header', function (done) {
      http.request({ hostname: '127.0.0.1', port: 8080, method: 'OPTIONS' }, function (res) {
        expect(res.statusCode).to.be.eq(200);
        expect(res.headers).to.have.property('access-control-allow-origin', 'http://127.0.0.1:8090');
        done();
      }).end();
    });

    it('should respond with allow credential header', function (done) {
      http.request({ hostname: '127.0.0.1', port: 8080, method: 'OPTIONS' }, function (res) {
        expect(res.statusCode).to.be.eq(200);
        expect(res.headers).to.have.property('access-control-allow-credentials', 'true');
        done();
      }).end();
    });

    it('should respond with allow methods header', function (done) {
      http.request({ hostname: '127.0.0.1', port: 8080, method: 'OPTIONS' }, function (res) {
        expect(res.statusCode).to.be.eq(200);
        expect(res.headers).to.have.property('access-control-allow-methods', 'GET, POST');
        done();
      }).end();
    });

    it('should respond with allow headers header', function (done) {
      http.request({ hostname: '127.0.0.1', port: 8080, method: 'OPTIONS' }, function (res) {
        expect(res.statusCode).to.be.eq(200);
        expect(res.headers).to.have.property('access-control-allow-headers', 'X-what, X-ever');
        done();
      }).end();
    });

    it('should respond with allow max-age header', function (done) {
      http.request({ hostname: '127.0.0.1', port: 8080, method: 'OPTIONS' }, function (res) {
        expect(res.statusCode).to.be.eq(200);
        expect(res.headers).to.have.property('access-control-max-age', '600');
        done();
      }).end();
    });

  });

  describe('OPTIONS request with origin:true', function () {
    var proxy;

    before(function (then) {
      nock('http://api.domain.com')
        .get('/').reply(200, 'data')
        ;
      proxy = corsProxy({
        source: 'http://api.domain.com',
        bind: 'http://127.0.0.1:8080/',
        origin: true
      }).on('listening', then);
    });

    after(function (done) {
      nock.cleanAll();
      proxy.close(done);
    });


    it('should respond with a value of allow origin header matching the source request', function (done) {
      http.request({ hostname: '127.0.0.1', port: 8080, method: 'OPTIONS', headers:{ Origin: 'http://127.0.0.1:8090'} }, function (res) {
        expect(res.statusCode).to.be.eq(200);
        expect(res.headers).to.have.property('access-control-allow-origin', 'http://127.0.0.1:8090');
        done();
      }).end();
    });

  });

  describe('GET request', function () {
    var proxy;

    before(function (then) {
      nock('http://api.domain.com')
        .get('/').times(6).reply(200, 'data')
        .get('/qs').query({q: 's'}).reply(200, 'qs')
        ;
      proxy = corsProxy({
        source: 'http://api.domain.com',
        bind: 'http://127.0.0.1:8080/',
        origin: 'http://127.0.0.1:8090',
        credentials: true,
        methods: 'GET, POST',
        headers: 'X-what, X-ever',
        maxage: 600
      }).on('listening', then);
    });

    after(function (done) {
      nock.cleanAll();
      proxy.close(done);
    });

    it('should send a get request to the target', function (done) {
      http.request({ hostname: '127.0.0.1', port: 8080, method: 'GET' }, function (res) {
        res.on('data', function (chunk) {
          expect(chunk.toString('utf8')).to.be.eq('data');
          done();
        });
      }).end();
    });

    it('should send a get request with its QS', function (done) {
      http.request({ hostname: '127.0.0.1', port: 8080, method: 'GET', path:'/qs?q=s' }, function (res) {
        res.on('data', function (chunk) {
          expect(chunk.toString('utf8')).to.be.eq('qs');
          done();
        });
      }).end();
    });

    it('should not respond with allow origin header', function (done) {
      http.request({ hostname: '127.0.0.1', port: 8080, method: 'GET' }, function (res) {
        expect(res.statusCode).to.be.eq(200);
        expect(res.headers).to.have.property('access-control-allow-origin', 'http://127.0.0.1:8090');
        done();
      }).end();
    });

    it('should respond with allow credential header', function (done) {
      http.request({ hostname: '127.0.0.1', port: 8080, method: 'GET' }, function (res) {
        expect(res.statusCode).to.be.eq(200);
        expect(res.headers).to.have.property('access-control-allow-credentials', 'true');
        done();
      }).end();
    });

    it('should respond with allow methods header', function (done) {
      http.request({ hostname: '127.0.0.1', port: 8080, method: 'GET' }, function (res) {
        expect(res.statusCode).to.be.eq(200);
        expect(res.headers).to.have.property('access-control-allow-methods', 'GET, POST');
        done();
      }).end();
    });

    it('should not respond with allow headers header', function (done) {
      http.request({ hostname: '127.0.0.1', port: 8080, method: 'GET' }, function (res) {
        expect(res.statusCode).to.be.eq(200);
        expect(res.headers).to.not.have.keys('access-control-allow-headers');
        done();
      }).end();
    });

    it('should not respond with allow max-age header', function (done) {
      http.request({ hostname: '127.0.0.1', port: 8080, method: 'GET' }, function (res) {
        expect(res.statusCode).to.be.eq(200);
        expect(res.headers).to.not.have.keys('access-control-max-age');
        done();
      }).end();
    });

  });

  describe('GET request with origin:true', function () {
    var proxy;

    before(function (then) {
      nock('http://api.domain.com')
        .get('/').reply(200, 'data')
        ;
      proxy = corsProxy({
        source: 'http://api.domain.com',
        bind: 'http://127.0.0.1:8080/',
        origin: true
      }).on('listening', then);
    });

    after(function (done) {
      nock.cleanAll();
      proxy.close(done);
    });


    it('should respond with a value of allow origin header matching the source request', function (done) {
      http.request({ hostname: '127.0.0.1', port: 8080, method: 'GET', headers:{ Origin: 'http://127.0.0.1:8090'} }, function (res) {
        expect(res.statusCode).to.be.eq(200);
        expect(res.headers).to.have.property('access-control-allow-origin', 'http://127.0.0.1:8090');
        done();
      }).end();
    });

  });

  describe('POST request', function () {
    var proxy;

    before(function (then) {
      nock('http://api.domain.com')
        .post('/upload').reply(200, 'data');
      proxy = corsProxy({
        source: 'http://api.domain.com',
        bind: 'http://127.0.0.1:8080/'
      }).on('listening', then);
    });

    after(function (done) {
      nock.cleanAll();
      proxy.close(done);
    });

    it('should send a post request to the target', function (done) {
      var data = JSON.stringify({ msg: 'Hello World!' }),
        options = {
          hostname: '127.0.0.1',
          port: 8080,
          path: '/upload',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length
          }
        },

        req = http.request(options, function (res) {
          expect(res.statusCode).to.be.eq(200);

          res.on('data', function (chunk) {
            expect(chunk.toString('utf8')).to.be.eq('data');
            done();
          });
        });

      req.write(data);
      req.end();
    });

  });

});
