# cors-proxy

A proxy to handle CORS on non-compatible CORS websites

## notes

It s early lifetime of this module, if you find an issue, report it.

## Features

- Preflighted requests
- X-Forward headers
- SSL

# Usage

```
cors-proxy 1.0.0
  A proxy to handle CORS on non-compatible CORS websites

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
```

## todos

- Write tests for SSL handling on both proxy / proxified resources
- real life testings

## Read more

- https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
- http://stackoverflow.com/questions/19084340/real-life-usage-of-the-x-forwarded-host-header
- http://docs.aws.amazon.com/ElasticLoadBalancing/latest/DeveloperGuide/x-forwarded-headers.html
- https://en.wikipedia.org/wiki/X-Forwarded-For
- https://en.wikipedia.org/wiki/List_of_HTTP_header_fields#Common_non-standard_request_fields
- https://nodejs.org/api/http.html

## Credits

Many inspiration provided by [drowzy's work](https://github.com/drowzy/pico-proxy)
