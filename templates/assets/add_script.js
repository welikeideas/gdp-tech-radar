// Initialize the editor with a JSON schema
var editor = new JSONEditor(document.getElementById('editor_holder'),{
    schema: {
        type: "object",
        title: document.getElementById('titleField').value,
        properties: {
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
        notes: {
            type: "string",
            format: "textarea"
        }
        }
    },
    disable_collapse: true,
    disable_edit_json: true,
    disable_properties: true,
    theme: 'bootstrap3'
});

var goBack = function() {
    window.history.go(-1);
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
    xhttp.open("POST", "/api/add", false);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(payload);

}

document.getElementById('submitReturn').addEventListener('click',function() {
    submit(editor.getValue(), goBack);
});

document.getElementById('submit').addEventListener('click',function() {
    submit(editor.getValue(), reload);
});