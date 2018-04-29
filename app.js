var express = require('express');
var mongodb = require('mongodb');
var fs = require('fs');
var chart = require('./chart.js');
var basicAuth = require('express-basic-auth');
var argv = require('yargs').argv;
var handlebars = require('handlebars');
var bodyParser = require('body-parser');
var ObjectId = require('mongodb').ObjectID;

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

app.get('/add/:group', function(req, res) {

    var group = req.params.group;
    switch (group) {
        case "firstparty":
            var title = 'First Party Technology';
            break;
        case "techniques":
            var title = 'Technique/Process';
            break;
        case "languages":
            var title = 'Language/Framework';
            break;
        case "tools":
            var title = 'Tool';
            break;
        case "platforms":
            var title = 'Platform';
            break;
        default:
            break;
    }
    var hbs = fs.readFileSync('./templates/crud.hbs').toString();
    var template = handlebars.compile(hbs);
    var result = template({group:group,title:title,isAdd:true});
    res.send(result);

});

app.get('/edit/:group/:id', function(req, res) {

    var group = req.params.group;
    var id = req.params.id;
    switch (group) {
        case "firstparty":
            var title = 'First Party Technology';
            break;
        case "techniques":
            var title = 'Technique/Process';
            break;
        case "languages":
            var title = 'Language/Framework';
            break;
        case "tools":
            var title = 'Tool';
            break;
        case "platforms":
            var title = 'Platform';
            break;
        default:
            break;
    }

    mongodb.MongoClient.connect(mongoConnectionString, function(err, client) {

        if(err) throw err;

        var db = client.db(process.env.MONGODB_DB);
        var collection = db.collection(group);

        collection.findOne({"_id": new ObjectId(id)}, function(err, doc) {
            
            if(err) throw err;

            var hbs = fs.readFileSync('./templates/crud.hbs').toString();
            var template = handlebars.compile(hbs);
            var result = template({group:group,title:title,doc:JSON.stringify(doc),id:id});
            res.send(result);

        });

        

    });

});

app.get('/api', function(req, res){

    var response = {actions:[{GET:'/api/group/:group/all'},{GET:'/api/group/:group/id/:id'}],groups:['firstparty','techniques','languages','platforms','tools']};
    res.json(response);

});

app.post('/api/add', function(req, res){

    var group = req.body.group;
    var object = req.body.object;
    delete object._id;

    mongodb.MongoClient.connect(mongoConnectionString, function(err, client) {

        if(err) throw err;
    
        var db = client.db(process.env.MONGODB_DB);
        var collection = db.collection(group);

        collection.insert(object, {}, function(err, doc) {

            if(err) throw err;

            res.end();

        });

    });

});

app.post('/api/edit', function(req, res){

    var group = req.body.group;
    var object = req.body.object;
    var id = new ObjectId(object._id);
    delete object._id;

    mongodb.MongoClient.connect(mongoConnectionString, function(err, client) {

        if(err) throw err;
    
        var db = client.db(process.env.MONGODB_DB);
        var collection = db.collection(group);

        collection.updateOne({_id:id}, {$set:object}, {upsert:false}, function(err, doc) {
            
            if(err) throw err;

            res.end();

        });

    });

});

app.delete('/api/delete/:group/:id', function(req, res){

    var group = req.params.group;
    var id = new ObjectId(req.params.id);

    mongodb.MongoClient.connect(mongoConnectionString, function(err, client) {

        if(err) throw err;
    
        var db = client.db(process.env.MONGODB_DB);
        var collection = db.collection(group);

        collection.deleteOne({_id:id}, function(err, doc) {
            
            if(err) throw err;

            res.end();

        });

    });

});

app.get('/api/group/:group/all', function(req, res){

    var group = req.params.group;

    mongodb.MongoClient.connect(mongoConnectionString, function(err, client) {

        if(err) throw err;
    
        let db = client.db(process.env.MONGODB_DB)
    
        let collection = db.collection(group);
    
        collection.find({}).sort({ name: 1 }).toArray(function (err, docs) {

            if(err) throw err;

            res.send(docs);

        });
    });

});

app.get('/api/group/:group/id/:id', function(req, res){

    var group = req.params.group;
    var id = new ObjectId(req.params.id);

    mongodb.MongoClient.connect(mongoConnectionString, function(err, client) {

        if(err) throw err;
    
        let db = client.db(process.env.MONGODB_DB)
    
        let collection = db.collection(group);
    
        collection.findOne({_id:id}, function (err, doc) {

            if(err) throw err;

            res.send(doc);

        });
    });

});

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