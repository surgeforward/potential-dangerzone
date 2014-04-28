#!/usr/bin/env node

var Q     = require('q');
var _     = require('lodash');
var f     = require('util').format;
var args  = require('./lib/args');
var crawl = require('./lib/crawl');

if (args.debug) 
    require('node-monkey').start({ host: '127.0.0.1', port:'2222' });

Q.longStackSupport = true;

Q.all(_.map(args.languages, function (language) {
    crawl(language, args.repos);
})).then(function (folders) {
    log.debug(folders);
    log.debug('ALL DONE');
}).catch(function (err) {
    log.error(err.stack || err.message || err);
});