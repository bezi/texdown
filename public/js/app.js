var app = {};
app.save = function () {

};

app.editor = CodeMirror.fromTextArea(document.getElementById("editor-pane"), {
    mode:         "gfm",
    lineNumbers:  "true",
    lineWrapping: "true",
    theme:        "monokai"
});

app.compile = function() {
    console.log("Compiling. . .");
    var data = {};
    data.text = app.editor.getValue();
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            if (request.status === 200) {
                var response = JSON.parse(request.responseText); 
                document.getElementById('preview-pane').innerHTML = response.text; 
                // re-render math
                MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
                console.log("|-- compiling successful.");
            } else {
                console.log("|-- error in compiling.");
            }
        }
    }
    request.open('POST', '/compile', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(data));
};

app.init = function () {
    console.log("Initializing app. . .");
    document.getElementById('compile-button').onclick = app.compile;
    console.log("|-- app intialized.");
}

app.init();
