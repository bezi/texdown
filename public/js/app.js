var app = {};
app.save = function () {

};

app.editor = CodeMirror.fromTextArea(document.getElementById("editor-pane"), {
    mode:         "gfm",
    lineNumbers:  "true",
    lineWrapping: "true",
    theme:        "monokai",
    // Uncomment the following line if you want to use vim keybindings when testing
    // (the real thing will be in a settings menu later. For ease of use, this means 
    // that the vim.js file is statically included right now.)
    // keyMap:       "vim"
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
                $('#preview-pane pre code').addClass("prettyprint");
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

CodeMirror.commands.save = app.compile;

app.previewExpanded = false;
app.togglePreview = function() {
    $("#preview-col").toggleClass("preview-expand");
    $("#preview-col").toggleClass("col-md-6");
    $("#preview-col").toggleClass("container");
    app.previewExpanded = !app.previewExpanded;
}
app.expandButton = function() {
    app.togglePreview();
    if(app.previewExpanded) {
        // Let a background click reset the preview pane
        $('#editor-window').on('click', function(e) {
            var prevcol = $("#preview-col");
            if(!prevcol.is(e.target) && prevcol.has(e.target).length === 0) {
                app.togglePreview();
                $('#editor-window').off('click');
            }
        });
    }
    else {
        $('#editor-window').off('click');
    }
}

// TODO I'm going to add functionality similar to the above for this pane as well,
// but it will involve a little bit of a CSS rewrite (nothing major), so I'm putting
// it off for now
app.toggleHelp = function() {
    console.log("Toggling help...");
    $("#markdown-pane").toggleClass("hidden");
    $("#markdown-pane").toggleClass("show");
}

app.init = function () {
    console.log("Initializing app. . .");
    $('#compile-button').click(app.compile);
    $('#expand-button').click(app.expandButton);
    $('#markdown-button').click(app.toggleHelp);
    $(document).ready(function() {
        prettyPrint();
    })
    console.log("|-- app intialized.");
}

app.init();
