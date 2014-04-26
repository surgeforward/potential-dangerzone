var download = require('download');
var Q = require('q');

module.exports = function (url, dest, options) {
    var deferred = Q.defer();

    download(url, dest, options)
        .on('close', deferred.resolve)
        .on('error', deferred.reject);

    return deferred.promise;
};