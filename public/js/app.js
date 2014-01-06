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
                $('#preview-pane').html(response.text);
                // re-render math
                MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
                // re-render Google prettyprint
                $('#preview-pane pre').addClass("prettyprint");
                $('#preview-pane code').addClass("prettyprint");
                prettyPrint();
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

app.expanded = false;
app.shrink = function(e) {
    var container = $("#preview-pane");
    // Make sure that neither preview-pane nor any descendent 
    // of preview-pane was clicked
    if(!container.is(e.target) && container.has(e.target).length === 0) {
        $("#preview-col").toggleClass("preview-expand");
        $("#preview-col").toggleClass("col-md-6");
        $("#preview-col").toggleClass("container");
        app.expanded = !app.expanded;
        $("#editor-window").off('click');
    }
}
app.expand = function() {
    console.log("Toggling preview expansion...");
    $("#preview-col").toggleClass("preview-expand");
    $("#preview-col").toggleClass("col-md-6");
    $("#preview-col").toggleClass("container");
    app.expanded = !app.expanded;
    // Let the user click the background to shrink
    if(app.expanded) {
        $("#editor-window").on('click', app.shrink);
    }
    else {
        $("#editor-window").off('click');
    }
}

app.toggleHelp = function() {
    console.log("Toggling help...");
    $("#markdown-pane").toggleClass("hidden");
    $("#markdown-pane").toggleClass("show");
}

app.init = function () {
    console.log("Initializing app. . .");
    $('#compile-button').click(app.compile);
    $('#expand-button').click(app.expand);
    $('#markdown-button').click(app.toggleHelp);
    $(document).ready(function() {
        prettyPrint();
    })
    console.log("|-- app intialized.");
}

app.init();
