var chalk = require('chalk');
var util  = require('util');

module.exports = {
    debug: function (message) {
        console.log(chalk.blue('[debug]'), message);
    },
    error: function (message) {
        console.log(chalk.red('[error]'), message);
    }
};