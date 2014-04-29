var _         = require('lodash');
var f         = require('util').format;
var commander = require('commander');

commander
    .version(require('../package.json').version, '-v, --version')
    .option('-l, --languages [languages]', 'languages to get search for for repos [javascript]', list)
    .option('-r, --repos [num]', 'number of repos to get [5]', 5)
    .option('-d, --debug', 'start with node-monkey debugger')
    .parse(process.argv);

module.exports = commander;
if (!commander.languages) commander.languages = ['javascript'];

function list(val) {
    return val.split(',');
}