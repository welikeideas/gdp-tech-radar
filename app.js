var express = require('express');
var mongodb = require('mongodb');
var fs = require('fs');
var chart = require('./chart.js');
var basicAuth = require('express-basic-auth');
var argv = require('yargs').argv;

var app = express();

if (argv.dev && argv.dev == 'true') {
    var livereload = require('express-livereload');
    livereload(app, config={});
}

var mongoConnectionString = process.env.MONGODB_URI;

var getUnauthorisedResponse = function() {

    var result = '<h1>GDP Tech Radar</h1><p>Find access details in #gdp-architecture</p>';
    return result;

}

var credentials = {};
credentials[process.env.BASIC_AUTH_USER] = process.env.BASIC_AUTH_PASSWORD;
app.use(basicAuth({
    users: credentials,
    challenge: true,
    unauthorizedResponse: getUnauthorisedResponse
}))

app.use("/assets", express.static(__dirname + '/templates/assets'));

app.get('/', function(req, res){
    
    var group = "firstparty"
    chartResponse(req, res, group);

});

app.get('/firstparty', function(req, res){
    
    var group = "firstparty"
    chartResponse(req, res, group);

});

app.get('/techniques', function(req, res){
    
    var group = "techniques"
    chartResponse(req, res, group);

});

app.get('/languages', function(req, res){
    
    var group = "languages"
    chartResponse(req, res, group);

});

app.get('/platforms', function(req, res){
    
    var group = "platforms"
    chartResponse(req, res, group);

});

app.get('/tools', function(req, res){
    
    var group = "tools"
    chartResponse(req, res, group);

});

app.get('/api/all', function(req, res){

    console.log('fetching all records');

    mongodb.MongoClient.connect(mongoConnectionString, function(err, client) {

        if(err) throw err;
    
        let db = client.db(process.env.MONGODB_DB)
    
        let applications = db.collection('applications');
    
        applications.find({}).sort({ lifespan: 1 }).toArray(function (err, docs) {

            if(err) throw err;

            res.send(docs);

        });
    });

});

app.get('/api/status/:status', function(req, res){

    var status = req.params.status;

    console.log('fetching records by status');

    mongodb.MongoClient.connect(mongoConnectionString, function(err, client) {

        if(err) throw err;
    
        let db = client.db(process.env.MONGODB_DB)
    
        let applications = db.collection('applications');
    
        applications.find({ status: { $regex : new RegExp(status, "i") } }).sort({ lifespan: 1 }).toArray(function (err, docs) {

            if(err) throw err;

            res.send(docs);

        });
    });

});

app.get('/api/name/:name', function(req, res){

    var name = req.params.name;

    console.log('fetching records by name');

    mongodb.MongoClient.connect(mongoConnectionString, function(err, client) {

        if(err) throw err;
    
        let db = client.db(process.env.MONGODB_DB)
    
        let applications = db.collection('applications');
    
        applications.find({ name: { $regex : new RegExp(name, "i") } }).sort({ lifespan: 1 }).toArray(function (err, docs) {

            if(err) throw err;

            res.send(docs);

        });
    });

});

app.get('/api/lifespan/:lifespan', function(req, res){

    var lifespan = req.params.lifespan;

    console.log('fetching records by lifespan');

    mongodb.MongoClient.connect(mongoConnectionString, function(err, client) {

        if(err) throw err;
    
        let db = client.db(process.env.MONGODB_DB)
    
        let applications = db.collection('applications');
    
        applications.find({ lifespan: { $regex : new RegExp(lifespan, "i") } }).sort({ lifespan: 1 }).toArray(function (err, docs) {

            if(err) throw err;

            res.send(docs);

        });
    });

});

var chartResponse = function(req, res, group) {

    console.log('rendering tech radar chart');

    mongodb.MongoClient.connect(mongoConnectionString, function(err, client) {

        if(err) throw err;
    
        let db = client.db(process.env.MONGODB_DB)

        var collection = "";
        var groupTitle = "";

        switch (group) {
            case 'firstparty':
                collection = 'firstparty';
                groupTitle = 'First Party Technologies';
                break;
            case 'tools':
                collection = 'tools';
                groupTitle = 'Tools';
                break;
            case 'techniques':
                collection = 'techniques';
                groupTitle = 'Techniques & Processes';
                break;
            case 'platforms':
                collection = 'platforms';
                groupTitle = 'Platforms';
                break;
            case 'languages':
                collection = 'languages';
                groupTitle = 'Lanuages & Frameworks';
                break;
            default:
                break;
        }
    
        let list = db.collection(collection);

        var find = {};
        var viewTitle = "GDP";
        var filter = "";
        if (req.query.area) {
            find = {area:req.query.area};
            viewTitle = req.query.area;
            filter = "?area="+encodeURIComponent(req.query.area);
        }
        var sort = {name:1};
        if (req.query.sort) {
            if (req.query.sort == "name") {
                sort = {name:1};
            }
            if (req.query.sort == "area") {
                sort = {area:1};
            }
            if (req.query.sort == "lifespan") {
                sort = {lifespan:1};
            }
            if (req.query.sort == "status") {
                sort = {status:1};
            }
        }
    
        list.find(find).sort(sort).toArray(function (err, docs) {

            if(err) throw err;

            var result = chart.build(docs, viewTitle, groupTitle, filter);

            res.send(result);

        });
    });

}

var port = (process.env.PORT) ? process.env.PORT : 3000;

app.listen(port);