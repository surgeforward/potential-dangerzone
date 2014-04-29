#!/usr/bin/env node

require('events').EventEmitter.prototype._maxListeners = 300;

var Q     = require('q');
var _     = require('lodash');
var f     = require('util').format;
var args  = require('./lib/args');
var crawl = require('./lib/crawl');
var log   = require('./lib/log');

if (args.debug) 
    require('node-monkey').start({ host: '127.0.0.1', port:'2222' });

// Q.longStackSupport = true;

Q.all(_.map(args.languages, function (language) {
    return crawl(language, args.repos);
})).then(function (languages) {
    log.info('ALL DONE');
}).catch(function (err) {
    log.error(err.stack || err.message || err);
});