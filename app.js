var express = require('express');
var mongodb = require('mongodb');
var fs = require('fs');
var handlebars = require('handlebars');

var app = express();
var mongoConnectionString = process.env.MONGODB_URI;

handlebars.registerHelper('sanitizeClass', function(classString) {
    return classString.toLowerCase().replace(/\W/g, '');
});

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
    
        applications.find({}).sort({ name: 1 }).toArray(function (err, docs) {

            if(err) throw err;

            var apps = [];
            var minSpan = 999;
            var maxSpan = 0;

            for (var docKey in docs) {
                var doc = docs[docKey];
                if (doc.lifespan < minSpan) {
                    minSpan = doc.lifespan;
                }
                if (doc.lifespan > maxSpan) {
                    maxSpan = doc.lifespan;
                }
            }

            maxSpan++;

            var list = {};
            list.applications = [];
            list.statuses = {};
            list.statuses.assess = 0;
            list.statuses.trial = 0;
            list.statuses.use = 0;
            list.statuses.hold = 0;
            list.statuses.retire = 0;

            for (var docKey in docs) {
                var doc = docs[docKey];
                doc.width = ((doc.lifespan+1)/maxSpan) * 100;
                list.applications.push(doc)
                if (doc.status == "Assess") {
                    list.statuses.assess++;
                }
                if (doc.status == "Trial") {
                    list.statuses.trial++;
                }
                if (doc.status == "Use") {
                    list.statuses.use++;
                }
                if (doc.status == "Hold") {
                    list.statuses.hold++;
                }
                if (doc.status == "Retire") {
                    list.statuses.retire++;
                }
            }

            var i = 0;
            var year = (new Date()).getFullYear();
            list.years = [];
            while (i < maxSpan) {
                list.years.push({"year":year});
                year++;
                i++;
            }
            list.yearsWidth = 100/list.years.length;

            var hbs = fs.readFileSync('./templates/chart.hbs').toString();
            var template = handlebars.compile(hbs);
            var result = template(list);

            res.send(result);

        });
    });

});

var port = (process.env.PORT) ? process.env.PORT : 3000;

app.listen(port);