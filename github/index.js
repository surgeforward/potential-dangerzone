var Q        = require('q');
var _        = require('lodash');
var log      = require('./lib/log');
var download = require('./lib/download');
var f        = require('util').format;

var github = require('octonode');
// require('node-monkey').start({ host: '127.0.0.1', port:'2222' });

Q.longStackSupport = true;

var client = github.client();
var ghsearch = client.search();
var searchRepos = Q.nbind(ghsearch.repos, ghsearch);

log.debug('Getting list of repos...');
Q.all(_.map(_.range(5), function (page) {
    return searchRepos({
        q: 'language:javascript',
        page: page + 1,
        per_page: 5, // it appears that any number > 100 will default to 100
    });
})).then(function (both) {
    // 'both' is in [[repoData, headers], [repoData, headers], ...]
    var repos = _.chain(both).pluck(0).flatten('items').value();
    log.debug(f('Got list of %d repos', repos.length));
    
    log.debug('Downloading repos...');
    return Q.all(_.map(repos, function (repo) {
        var url = f('%s/archive/master.tar.gz', repo.html_url);
        var dest = f('./tmp/%s', repo.name);
        log.debug(f('Downloading %s into %s...', repo.name, dest));

        return download({ 
            url: url, 
            name: f('%s.tar.gz', repo.name)
        }, './tmp', { 
            extract: true 
        }).then(function () {
            log.debug(f('Downloaded %s', repo.name));
            // I think this is how it works...
            return f('./tmp/%s-master/', repo.name);
        });
    }));
}).then(function (folders) {
    log.debug(folders);
    log.debug('All repos downloaded and unzipped');
    // now what...?
}).catch(function (err) {
    log.error(err.stack || err.message || err);
});