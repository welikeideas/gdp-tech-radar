var express = require('express');
var mongodb = require('mongodb');
var fs = require('fs');
var chart = require('./chart.js');

var app = express();
var mongoConnectionString = process.env.MONGODB_URI;

app.get('/', function(req, res){

    var html = fs.readFileSync('./templates/index.html').toString();
    res.send(html);

});

app.get('/all', function(req, res){

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

app.get('/status/:status', function(req, res){

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

app.get('/name/:name', function(req, res){

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

app.get('/lifespan/:lifespan', function(req, res){

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

app.get('/chart', function(req, res){

    console.log('rendering tech radar chart');

    mongodb.MongoClient.connect(mongoConnectionString, function(err, client) {

        if(err) throw err;
    
        let db = client.db(process.env.MONGODB_DB)
    
        let applications = db.collection('applications');

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
    
        applications.find(find).sort(sort).toArray(function (err, docs) {

            if(err) throw err;

            var result = chart.build(docs, viewTitle, filter);

            res.send(result);

        });
    });

});

var port = (process.env.PORT) ? process.env.PORT : 3000;

app.listen(port);