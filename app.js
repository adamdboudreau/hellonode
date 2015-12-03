var restify = require('restify'),
    port = process.env.PORT || 3000,
    server = restify.createServer(),
    cassandraOpts = require('./cassandra_defaults.json'),
    routePrefix = '/v1',
    cassandra = require('cassandra-driver'),
    cassandraClient = new cassandra.Client({ contactPoints: cassandraOpts.remote.hostIps, keyspace: cassandraOpts.remote.keyspace}),
    query;

server.get('/echo', function (req, res, next) {
    res.send('hello world 2');
    next();
});

server.get({path: routePrefix + '/accounts', flags: 'i'}, getAccounts);

function getAccounts(req, res, next) {
    query = 'select * from accounts';
    cassandraClient.execute(query, [], function(err, result) {
        var accounts = [];
        if (err) {
            console.log(err);
            throw(err);
        } else {
            for (var i=0; i < result.rowLength; i++) {
                accounts.push(result.rows[i]);
            }
            res.send(accounts);
            next();
        }
    });
}

server.listen(port, function() {
    var msg = 'Starting service using port \'' + port + '\' and environment \'' + process.env.NODE_ENV + '\'';
    console.log(msg);
});