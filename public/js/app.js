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

app.expand = function() {
//     console.log("Previewing... ");
//     var data = {};
//     data.content = $("#preview-pane").html();
//     var request = new XMLHttpRequest();
//     request.onreadystatechange = function() {
//         if (request.readyState === 4) {
//             if (request.status === 200) {
//                 var head = "<title>Test</title>";
//                 var body = JSON.parse(request.responseText).content;
//                 console.log(head);
//                 console.log(body);
//                 var w = window.open();
//                 $(w.document.body).html(body);
//                 w.document.getElementsByTagName("head")[0].innerHTML = head;
//                 console.log("|-- preview successful.");
//             } else {
//                 console.log("|-- error in previewing.");
//             }
//         }
//     }
//     request.open('POST', '/preview', true);
//     request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//     request.send(JSON.stringify(data));
//     console.log("|-- preview request sent.");
    console.log("Toggling preview expansion...");
    $("#preview-col").toggleClass("preview-expand");
    $("#preview-col").toggleClass("col-md-6");
    $("#preview-col").toggleClass("container");
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
