var app = {};
app.save = function () {

};

app.editor = CodeMirror.fromTextArea(document.getElementById("texdown-code"), {
    mode:        "gfm",
    lineNumbers: "true",
    theme:       "monokai"
});

app.compile = function() {
    var data = {};
    data.text = app.editor.getValue();
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            if (request.status === 200) {
                var response = JSON.parse(request.responseText); 
                document.getElementById('texdown-preview').innerHTML = response.text; 
            } else {
                console.log("Shit's fucked up, mate.");
            }
        }
    }
    request.open('POST', '/compile', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(data));
};

app.init = function () {
    document.getElementById('compile-button').onclick = app.compile;
}

app.init();
