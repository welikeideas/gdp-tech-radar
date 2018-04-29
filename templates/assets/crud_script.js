var startData = null;
var isEdit = false;

if (document.getElementById('idField') != undefined) {
    var id = document.getElementById('idField').value;
    startData = JSON.parse(document.getElementById('docField').value);
    isEdit = true;
}

var editor = new JSONEditor(document.getElementById('editor_holder'),{
    schema: {
        type: "object",
        title: document.getElementById('titleField').value,
        properties: {
            _id: {
                type: "string",
                readOnly: true
            },
            name: {
                type: "string"
            },
            area: {
                type: "string"
            },
            status: {
                type: "string",
                enum: [
                    "Assess",
                    "Trial",
                    "Use",
                    "Hold",
                    "Retire"
                ],
                default: "Use"
            },
            lifespan: {
                type: "integer",
                enum: [
                    1,2,3,4,5,6,7,8,9,10
                ],
                default: 3
            },
            reviewed: {
                type: "string"
            },
            notes: {
                type: "string",
                format: "textarea"
            },
            link: {
                type: "string",
                format: "url"
            }
        }
    },
    disable_collapse: true,
    disable_edit_json: true,
    disable_properties: true,
    theme: 'bootstrap3',
    startval: startData
});

var goBack = function() {
    location.replace(document.referrer);
}

var reload = function() {
    location.reload();
}

var submit = function(object, action) {

    var payload = {};
    payload.group = document.getElementById('groupField').value;
    payload.object = object;
    payload = JSON.stringify(payload);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            action();
        }
    };
    if (isEdit) {
        xhttp.open("POST", "/api/edit", false);
    } else {
        xhttp.open("POST", "/api/add", false);
    }
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(payload);

}

document.getElementById('submitReturn').addEventListener('click',function() {
    submit(editor.getValue(), goBack);
});

document.getElementById('submit').addEventListener('click',function() {
    submit(editor.getValue(), reload);
});

document.getElementById('delete').addEventListener('click', function() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            location.replace(document.referrer);
        }
    };
    xhttp.open("DELETE", "/api/delete/"+document.getElementById('groupField').value+"/"+id, false);
    xhttp.send();
});