#!/usr/bin/env node

function usage () {/*

Usage
  cors-proxy [opts]

Options
  -B|--bind [proto://host:port]     Proto, host, port to bind.
                                    Defaults to http://127.0.0.1:8000/
  -s|--source [proto://host:port]   Address to proxify
  -c|--credentials                  With credentials support
  -e|--exposed [headers exposed]    List of exposed headers, comma separated.
  -H|--headers [headers list]       List of allowed headers, comma separated.
  -m|--methods [methods list]       List of allowed methods, comma separated.
  -M|--maxage [number]              Max-Age value for pre-flighted requests
  -o|--origin [proto://host:port/]  Which origin to allow,
                                    if not specified, returns request host.
  -q|--quick                        Quick setup,
                                    [GET,POST] + Credentials + request host.
  -v|--verbose [modules]            Verbose
  -h|--help                         Show help

Examples
  cors-proxy -v
  cors-proxy -v -s http://127.0.0.1:8080/
  cors-proxy -v -s http://127.0.0.1:8080/ -c
  cors-proxy -v -s http://127.0.0.1:8080/ -o http://127.0.0.1:8081/ -c
  cors-proxy -v -s http://127.0.0.1:8080/ -o http://127.0.0.1:8081/ -m GET,POST -c
  cors-proxy -v -s http://127.0.0.1:8080/ -o http://127.0.0.1:8081/ -m GET,POST -H X-what,X-ever -c
  cors-proxy -v -q -s http://127.0.0.1:8080/
 */}

var argv  = require('minimist')(process.argv.slice(2));
var pkg   = require('./package.json')
var debug = require('@maboiteaspam/set-verbosity')(pkg.name, process.argv);
var help  = require('@maboiteaspam/show-help')(usage, process.argv, pkg);

// normalize arguments
argv.bind = argv.b || argv.bind || 'http://127.0.0.1:8000/';

argv.source       = argv.source   || argv.s;
argv.credentials  = argv.credentials || argv.c;
argv.exposed      = argv.exposed  || argv.e;
argv.headers      = argv.headers  || argv.H;
argv.methods      = argv.methods  || argv.m;
argv.origin       = argv.origin   || argv.o;
argv.quick        = argv.quick    || argv.g;
argv.maxage       = argv.maxage   || argv.M;

// realize the quick setup
if (argv.q || argv.quick) {

  if (argv.methods) argv.methods += ',GET,POST';
  else argv.methods = 'GET,POST';

  if (argv.headers) argv.headers += ',Authorization';
  else argv.headers = 'Authorization';

  argv.origin = argv.origin || true;

  argv.credentials = true;
}

// check the conf seems correct, according to our knowledge,
// http://stackoverflow.com/questions/19743396/cors-cannot-use-wildcard-in-access-control-allow-origin-when-credentials-flag-i
if (argv.origin==='*' && argv.credentials)
  throw 'If you want use crednetials support, ' +
  'you must not set origin to *, ' +
  'leave it empty';

// run it!
require('./index')(argv)
.once('error', console.error.bind(console))
.on('listening', function () {
  debug('server listening')
  console.log('%s is proxified at %s', argv.source, argv.bind)
})
