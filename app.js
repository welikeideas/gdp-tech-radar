var express = require('express');
var mongodb = require('mongodb');
var fs = require('fs');
var chart = require('./chart.js');
var basicAuth = require('express-basic-auth');
var argv = require('yargs').argv;
var handlebars = require('handlebars');
var bodyParser = require('body-parser');

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

app.use(bodyParser.json());

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

app.get('/add/firstparty', function(req, res) {

    var group = "firstparty"
    var hbs = fs.readFileSync('./templates/add.hbs').toString();
    var template = handlebars.compile(hbs);
    var result = template({group:group,title:'First Party Technology'});
    res.send(result);

});

app.get('/add/techniques', function(req, res) {

    var group = "techniques"
    var hbs = fs.readFileSync('./templates/add.hbs').toString();
    var template = handlebars.compile(hbs);
    var result = template({group:group,title:'Technique/Process'});
    res.send(result);

});

app.get('/add/languages', function(req, res) {

    var group = "languages"
    var hbs = fs.readFileSync('./templates/add.hbs').toString();
    var template = handlebars.compile(hbs);
    var result = template({group:group,title:'Language/Framework'});
    res.send(result);

});

app.get('/add/platforms', function(req, res) {

    var group = "platforms"
    var hbs = fs.readFileSync('./templates/add.hbs').toString();
    var template = handlebars.compile(hbs);
    var result = template({group:group,title:'Platform'});
    res.send(result);

});

app.get('/add/tools', function(req, res) {

    var group = "tools"
    var hbs = fs.readFileSync('./templates/add.hbs').toString();
    var template = handlebars.compile(hbs);
    var result = template({group:group,title:'Tool'});
    res.send(result);

});

app.post('/api/add', function(req, res){

    var group = req.body.group;
    var object = req.body.object;

    mongodb.MongoClient.connect(mongoConnectionString, function(err, client) {

        if(err) throw err;
    
        var db = client.db(process.env.MONGODB_DB);
        var collection = db.collection(group);

        collection.insert(object, {}, function(err, doc) {
            res.end();
        });

    });

});

/* app.get('/api/all', function(req, res){

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

    mongodb.MongoClient.connect(mongoConnectionString, function(err, client) {

        if(err) throw err;
    
        let db = client.db(process.env.MONGODB_DB)
    
        let applications = db.collection('applications');
    
        applications.find({ lifespan: { $regex : new RegExp(lifespan, "i") } }).sort({ lifespan: 1 }).toArray(function (err, docs) {

            if(err) throw err;

            res.send(docs);

        });
    });

}); */

var chartResponse = function(req, res, group) {

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

            var result = chart.build(docs, viewTitle, groupTitle, group, filter);

            res.send(result);

        });
    });

}

var port = (process.env.PORT) ? process.env.PORT : 3000;

app.listen(port);