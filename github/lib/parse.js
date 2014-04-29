var _            = require('lodash');
var Q            = require('q');
var log          = require('./log');
var f            = require('util').format;
var chalk        = require('chalk');
var db           = require('./db')('codecollection');
var fs           = require('fs');
var path         = require('path');
var isBinaryFile = require('isbinaryfile');

// denodeify wasn't working here for some reason...
// var readFile = Q.denodeify(fs.feadFile);
var readFile = (function (fn) {
    return function (file, opts) {
        var deferred = Q.defer();

        fn(file, opts, function (err, text) {
            if (err)
                return deferred.reject(err);
            deferred.resolve(text);
        });

        return deferred.promise;
    };
})(fs.readFile);

var isBinary = Q.denodeify(isBinaryFile);

module.exports = function (folder, language) {
    log.info(f('Parsing %s...', chalk.yellow(folder)));

    walk(folder).then(function (files) {
        return Q.all(_.map(files, function (file) {
            return isBinary(file).then(function (isBin) {
                if (!isBin) return file;
            });
        })).then(function (files) {
            // removes all binary files
            files = _.compact(files);

            return Q.all(_.map(files, function (file) {
                return readFile(file, 'utf-8').then(function (contents) {
                    var entry = {
                        language: language,
                        ext: path.extname(file),
                        filename: path.basename(file),
                        code: contents.split("\n")
                    };

                    // this is async, but we don't really need to wait
                    db.save(entry);

                    return entry;
                }, function (err) {
                    // probably cuz it couldn't be opened, or 
                    // couldn't be opened as utf-8, which is fine!
                });
            }));
        });
    }).then(function(entries) {
        log.info(f('Parsed %s...', chalk.yellow(folder)));
    }).catch(function (err) {
        log.error(err.stack || err.message || err);
        process.exit();
    });

    // db.save();
    return folder;
};

// adapted from http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
var walkAsync = function(dir, done) {
    if (dir[dir.length - 1] === '/') dir = dir.slice(0, dir.length - 1);
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};
var walk = Q.denodeify(walkAsync);