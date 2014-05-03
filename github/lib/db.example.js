var mongojs = require('mongojs');

module.exports = function (collection) {
    // simple usage for a local db
    var db = mongojs('mydb', [collection]);

    // // the db is on a remote server (the port default to mongo)
    // var db = mongojs('example.com/mydb', [collection]);

    // // we can also provide some credentials
    // var db = mongojs('username:password@example.com/mydb', [collection]);

    return db[collection];
};

