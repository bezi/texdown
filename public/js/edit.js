var app = {};

/**
 * Utility function to show an alert.
 *
 * @param options an object with the following options: (optional in parens)
 *
 * @param header A (short) message that will be bolded.
 * @param body The rest of the message
 * @param (type) One of success, info, warning, or danger, (changes the color)
 * @param (delay) Time (in ms) to display the message before fading
 * @param (fade) How long to animate the fade
 */
app.animateAlert = function(options) {
    // Store defaults
    config = {
        header: 'Hello!',
        body: 'This is an alert.',
        type: 'success',
        delay: 1500,
        fade: 400
    }

    // Load options
    config.header = options.header || config.header;
    config.body   = options.body   || config.body;
    config.type   = options.type   || config.type;
    config.delay  = (options.type === 'warning' || 
                     options.type === 'danger') ? 3000 : config.delay;
    config.delay  = options.delay  || config.delay;
    config.fade   = options.fade   || config.fade;
    console.log(config);

    // Ease of use
    var container = $('#message-box');
    
    // Apply type
    container.removeClass('alert-success').removeClass('alert-info')
        .removeClass('alert-warning').removeClass('alert-danger');
    container.addClass('alert-' + config.type);

    // Dispatch
    container.html('<strong>' + config.header + '</strong> ' + config.body);
    container.show().delay(config.delay).fadeOut(config.fade);
}

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

app.compile = function(force) {
    console.log("Compiling. . .");
    var data = {};
    data.text = app.editor.getValue();
    if(!force && !data.text) {return;}
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

app.save = function (e) {
    e.preventDefault();
    console.log('Saving...');
    var data = {}; data.file = {}; data.user = {};

    data.user.id = $('body').data().userid;
    if (!data.user.id) {
        app.animateAlert({
            header: 'Whoops!', 
            body: 'You have to be signed in to save files.', 
            type: 'danger', 
        });
        return;
    }

    data.file.filename = $('#filename').val();
    if (data.file.filename == '') {
        app.animateAlert({
            header: 'Whoops!', 
            body: 'Please enter a filename.', 
            type: 'danger', 
        });
        return;
    }

    data.file.id = $('#filename').data().fileid;
    data.file.text = app.editor.getValue();

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            var statMesg = JSON.parse(request.responseText).statMesg;
            if (request.status === 200) {
                app.animateAlert({
                    header:'Success!', 
                    body: statMesg
                });
                console.log("|-- saving successfu");
            } else {
                app.animateAlert({
                    header:'Oh no!', 
                    body: statMesg + " (error: " + request.status + ")", 
                    type: 'danger'
                });
                console.log("|-- error in compiling.");
            }
        }
    }
    request.open('POST', '/save', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(data));
};

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
    console.log('Toggling help...');
    $('#markdown-pane').toggleClass('hidden');
    $('#markdown-pane').toggleClass('show');
}

app.vimSourced = false;
app.emacsSourced = false;
app.setKeybindings = function(e) {
    if ($('#nokeys').is(e.target)) {
        $('#nokeys').addClass('btn-primary');
        $('#nokeys').removeClass('btn-default');
        
        $('#vimkeys').addClass('btn-default');
        $('#vimkeys').removeClass('btn-primary');
        $('#emacskeys').addClass('btn-default');
        $('#emacskeys').removeClass('btn-primary');

        app.editor.setOption("keyMap", "default");
        app.animateAlert({header: 'Success!', content: 'Keybindings turned off.'});
    }
    else if ($('#vimkeys').is(e.target)) {
        $('#vimkeys').addClass('btn-primary');
        $('#vimkeys').removeClass('btn-default');
        
        $('#nokeys').addClass('btn-default');
        $('#nokeys').removeClass('btn-primary');
        $('#emacskeys').addClass('btn-default');
        $('#emacskeys').removeClass('btn-primary');

        if(!app.vimSourced) {
            $('body').append('<script src="/lib/codemirror/keymap/vim.js"></script>');
        }
        app.editor.setOption("keyMap", "vim");
        app.animateAlert({header: 'Success!', content: 'Keybindings set to vim mode.'});
    }
    else if ($('#emacskeys').is(e.target)) {
        $('#emacskeys').addClass('btn-primary');
        $('#emacskeys').removeClass('btn-default');
        
        $('#nokeys').addClass('btn-default');
        $('#nokeys').removeClass('btn-primary');
        $('#vimkeys').addClass('btn-default');
        $('#vimkeys').removeClass('btn-primary');

        if(!app.emacsSourced) {
            $('body').append('<script src="/lib/codemirror/keymap/emacs.js"></script>')
        }
        app.editor.setOption("keyMap", "emacs");
        app.animateAlert({header: 'Success!', content: 'Keybindings set to emacs mode.'});
    }
}

app.init = function () {
    console.log('Initializing app. . .');
    app.compile(false);
    $('#compile-button').click(function() {app.compile(true)});
    $('#expand-button').click(app.expandButton);
    $('#markdown-button').click(app.toggleHelp);
    $(document).ready(function() {
        prettyPrint();
    })
    $('#save-button').click(app.save);
    $('#nokeys').click(app.setKeybindings);
    $('#vimkeys').click(app.setKeybindings);
    $('#emacskeys').click(app.setKeybindings);
    console.log('|-- app intialized.');
}

app.init();
