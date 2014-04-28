var _         = require('lodash');
var f         = require('util').format;
var commander = require('commander');

commander
  .version('0.1.0', '-v, --version')
  .option('-l, --language [language]', 'language to get search for for repos [javascript]', 'javascript')
  .option('-r, --records [num]', 'number of records to get [100]', determineRecords)
  .option('-d, --debug', 'start with node-monkey debugger')
  .parse(process.argv);

if (!commander.records) commander.records = determineRecords(100);

module.exports = commander;

function list(val) {
    return val.split(',');
}

function determineRecords(records) {
    if (!records) records = 100;
    records = +records;

    // max 100 per page
    var numPages = Math.ceil(records / 100);
    var leftover = records % 100;

    return _.map(_.range(numPages), function (page) {
        var perPage = Math.min(records, 100);
        if (page == numPages - 1 && leftover) perPage = leftover;
        return {
            page: page + 1,
            perPage: perPage
        };
    });
}
