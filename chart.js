var exports = module.exports = {};
var fs = require('fs');
var handlebars = require('handlebars');

handlebars.registerHelper('sanitizeClass', function(classString) {
    return classString.toLowerCase().replace(/\W/g, '');
});

exports.build = function(docs, title, filter) {

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
    list.areas = [];
    list.title = title;
    list.statuses = {};
    list.statuses.assess = 0;
    list.statuses.trial = 0;
    list.statuses.use = 0;
    list.statuses.hold = 0;
    list.statuses.retire = 0;
    var areaCheck = [];

    for (var docKey in docs) {
        var doc = docs[docKey];
        doc.width = ((doc.lifespan+1)/maxSpan) * 100;
        if (areaCheck[doc.area] == undefined) {
            var area = {};
            area.name = doc.area;
            area.url = "?area="+encodeURIComponent(doc.area);
            list.areas.push(area);
            areaCheck[doc.area] = true;
        }
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
    if (list.areas.length == 1) {
        list.areas = [];
    }
    
    list.sort = {};
    list.sort.name = (filter) ? filter + "&sort=name" : "?sort=name";
    list.sort.area = (filter) ? filter + "&sort=area" : "?sort=area";
    list.sort.lifespan = (filter) ? filter + "&sort=lifespan" : "?sort=lifespan";
    list.sort.status = (filter) ? filter + "&sort=status" : "?sort=status";

    list.showAll = (filter) ? true : false;

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

    return result;

}