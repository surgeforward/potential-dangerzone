var mongojs = require('mongojs');

// start DB by running this command github folder: mongod --dbpath db
module.exports = function (collection) {
    var db = mongojs('db', [collection]);
    return db[collection];
};
