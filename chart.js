var exports = module.exports = {};
var fs = require('fs');
var handlebars = require('handlebars');

handlebars.registerHelper('sanitizeClass', function(classString) {
    return classString.toLowerCase().replace(/\W/g, '');
});

var findSpanBoundaries = function(docs) {
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
    return [minSpan,maxSpan];
}

exports.build = function(docs, title, group, filter) {

    var spanBoundaries = findSpanBoundaries(docs);
    var maxSpan = spanBoundaries.pop();
    var minSpan = spanBoundaries.pop();

    var list = {items:[],areas:[],title:title,group:group,statuses:{assess:0,trial:0,use:0,hold:0,retire:0}};
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
        list.items.push(doc);
        switch (doc.status) {
            case "Assess":
                list.statuses.assess++;
                break;
            case "Trial":
                list.statuses.trial++;
                break;
            case "Use":
                list.statuses.use++;
                break;
            case "Hold":
                list.statuses.hold++;
                break;
            case "Retire":
                list.statuses.retire++;
                break;
            default:
                break;
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