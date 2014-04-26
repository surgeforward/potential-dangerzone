var Q        = require('q');
var _        = require('lodash');
var log      = require('./lib/log');
var download = require('./lib/download');

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
        per_page: 100, // it appears that any number > 100 will default to 100
    });
})).then(function (both) {
    // 'both' is in [[repoData, headers], [repoData, headers], ...]
    var repos = _.chain(both).pluck(0).flatten('items').value();
    log.debug('Got list of ' + repos.length + ' repos');
    
    log.debug('Downloading repos...');
    return Q.all(_.map(repos, function (repo) {
        var url = repo.html_url + '/archive/master.tar.gz';
        var dest = './tmp/' + repo.name;
        log.debug('Downloading ' + repo.name + ' into ' + dest + '...');

        return download({ 
            url: url, 
            name: repo.name + '.tar.gz' 
        }, './tmp', { 
            extract: true 
        }).then(function () {
            log.debug('Downloaded ' + repo.name);
            // I think this is how it works...
            return './tmp/' + repo.name + '-master/';
        });
    }));
}).then(function (folders) {
    // log.debug(folders);
    log.debug('All repos downloaded and unzipped');
    // now what...?
}).catch(function (err) {
    log.error(err.stack || err.message || err);
});