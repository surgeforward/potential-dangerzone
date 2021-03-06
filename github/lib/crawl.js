var Q        = require('q');
var _        = require('lodash');
var log      = require('./log');
var download = require('./download');
var f        = require('util').format;
var github   = require('octonode');
var parse    = require('./parse');
var chalk    = require('chalk');

var client = github.client();
var ghsearch = client.search();
var searchRepos = Q.nbind(ghsearch.repos, ghsearch);

module.exports = function (language, numRepos) {
    var requests = determineRequests(numRepos);

    log.info(f('Getting list of %s repos...', chalk.magenta(language)));
    return Q.all(_.map(requests, function (request) {
        return searchRepos({
            q: f('language:%s', language),
            page: request.page,
            per_page: request.perPage
        });
    })).then(function (both) {
        // 'both' is in [[repoData, headers], [repoData, headers], ...]
        var repos = _.chain(both).pluck(0).flatten('items').value();
        log.info(f('Got list of %d %s repos', repos.length, chalk.magenta(language)));
        
        log.info('Downloading repos...');
        return Q.all(_.map(repos, function (repo) {
            var url = f('%s/archive/master.tar.gz', repo.html_url);
            var dest = f('./tmp/%s', repo.name);
            log.info(f('Downloading %s into %s...', chalk.green(repo.name), chalk.yellow(dest)));

            return download({ 
                url: url, 
                name: f('%s.tar.gz', repo.name)
            }, './tmp', { 
                extract: true 
            }).then(function () {
                log.info(f('Downloaded %s', chalk.green(repo.name)));
                // I think this is how it works...
                return f('./tmp/%s-master/', repo.name);
            }).then(function (path) {
                return parse(path, language);
            });
        }));
    }).then(function (folders) {
        log.info(f('Finished processing %s', chalk.magenta(language)));
        return language;
    });
};

var maxPerPage = 100; // appears to be enforced by GitHub API
function determineRequests(records) {
    records = +records;

    var numPages = Math.ceil(records / maxPerPage);
    var leftover = records % maxPerPage;

    return _.map(_.range(numPages), function (page) {
        var perPage = Math.min(records, maxPerPage);
        if (page == numPages - 1 && leftover) perPage = leftover;
        return {
            page: page + 1,
            perPage: perPage
        };
    });
}
