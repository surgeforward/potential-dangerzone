var chalk = require('chalk');
var util  = require('util');

module.exports = {
    debug: function (message) {
        console.log(chalk.cyan('[debug]'), message);
    },
    info: function (message) {
        console.log(chalk.blue(' [info]'), message);
    },
    error: function (message) {
        console.log(chalk.red('[error]'), message);
    }
};