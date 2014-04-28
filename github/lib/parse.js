var Q     = require('q');
var log   = require('./log');
var f     = require('util').format;
var chalk = require('chalk');

module.exports = function (folder) {
    log.info(f('Parsing %s...', chalk.yellow(folder)));
    return folder;
};