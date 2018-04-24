var express = require('express');
var mongodb = require('mongodb');

var app = express();
var mongoConnectionString = process.env.MONGODB_URI;

app.get('/', function(req, res){

    var string = '<ul><li>GET <a href="/chart">/chart</a> - tech radar lifespan chart.</li><li>GET <a href="/all">/all</a> - fetch all records.</li><li>GET <a href="/name/shak-ng">/name/{app_name}</a> - fetch records by name, e.g. shak-ng.</li><li>GET <a href="/status/use">/status/{status}</a> - fetch records by status, e.g. use.</li><li>GET <a href="/lifespan/3">/lifespan/{lifespan}</a> - fetch records by lifespan, e.g. 3.</li></ul>';
    res.send(string);

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
    
        applications.find({}).sort({ lifespan: 1 }).toArray(function (err, docs) {

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
                apps.push({"name": doc.name,"span": doc.lifespan})
            }

            maxSpan++;

            var ul = [];

            for (var appsKey in apps) {
                var app = apps[appsKey];
                var colour = "green";
                if (app.span <= 1) {
                    colour = "red"
                } else if (app.span > 1 && app.span < 3) {
                    colour = "orange"
                }
                var width = (app.span/maxSpan) * 100;
                ul.push('<li style="background-color:'+colour+';width:'+width+'%;">'+app.name+'</li>')
            }

            res.send('<html><head><style>body{font-family:Arial;}ul{list-style-type:none;}li{height:30px;margin-bottom:10px;line-height:30px;padding-left: 5px;white-space:nowrap;}</style></head><body><h1>GDP Platform Lifespan Chart</h1><ul>'+ul.join('')+'</ul></body></html>');

        });
    });

});

app.listen(process.env.PORT);