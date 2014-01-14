var app = {}; app.data = {}; app.data.user = {}; app.data.file = {};
app.settings = {
    autosave: false,
    autocomp: false,
    keys: '',
    keyButtons: ['#nokeys', '#vimkeys', '#emacskeys'],
    vimSourced: false,
    emacsSourced: false,
    alertConf: {
        header: 'Hello!',
        body: 'The action completed successfully.',
        type: 'success',
        delay: 1500,
        fade: 400
    },
    editor: {
        mode:         "gfm",
        lineNumbers:  "true",
        lineWrapping: "true",
        theme:        "monokai",
    },
    editorCreated: false,
    marked: {
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: true,
      langPrefix: 'language-',
    }
}

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
    // Load defaults
    var config = app.settings.alertConf;
    // Load options
    config.header = options.header || config.header;
    config.body   = options.body   || config.body;
    config.type   = options.type   || config.type;
    config.delay  = (options.type === 'warning' || 
                     options.type === 'danger') ? 3000 : config.delay;
    config.delay  = options.delay  || config.delay;
    config.fade   = options.fade   || config.fade;

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

app.compile = function(force) {
    var raw = app.editor.getValue();
    if(!force && !raw) {return;} // Quit unless we have to or we don't have anything
    console.log("├─┬ Compiling. . .");
    var texdown = raw
        .replace(/\\\(/g, '<script type="math/tex">')
        .replace(/\\\)/g, '</script>')
        .replace(/\\\[/g, '<script type="math/tex; mode=display">')
        .replace(/\\\]/g, '</script>');
    marked(texdown, function(err, compiled) {
        if (err) {
            console.log('│ └─ error in compiling: ' + err);
        } else {
            var pane = $('#preview-pane');
            var scroll = pane.scrollTop();
            var bottom = false;
            if(scroll + pane.innerHeight() === pane[0].scrollHeight) {
                bottom = true;
            }
            pane.html(compiled);
            // re-render math
            MathJax.Hub.Queue(["Typeset",MathJax.Hub], [function() {
                $('#preview-pane').scrollTop(bottom ? pane[0].scrollHeight : scroll);
            }]);
            // re-render Google prettyprint
            $('#preview-pane pre').addClass("prettyprint");
            $('#preview-pane pre code').addClass("prettyprint");
            prettyPrint();
            console.log("│ └─ compiling successful.");
        }
    });
};

app.save = function () {
    console.log('├─┬ Saving...');

    if (!app.data.user.id) {
        app.animateAlert({
            header: 'Whoops!', 
            body: 'You have to be signed in to save files.', 
            type: 'danger', 
        });
        console.log('│ └─ error in saving: user not signed in.');
        return;
    }
    app.data.file.filename = $('#filename').val();
    if (!app.data.file.filename) {
        app.animateAlert({
            header: 'Whoops!', 
            body: 'Please enter a filename.', 
            type: 'danger', 
        });
            console.log('│ └─ error in saving: no filename provided.');
        return;
    }
    app.data.file.text = app.editor.getValue();

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            var statMesg = JSON.parse(request.responseText).statMesg;
            var fileid = JSON.parse(request.responseText).fileid;
            if (request.status === 200) {
                if(app.settings.autosave) {
                    $('#save-status').html(' Saved');
                } else {
                    app.animateAlert({
                        header:'Success!', 
                        body: 'Your file was saved.'
                    });
                }
                if(/\/edit$/g.test(document.URL)) {
                    setTimeout(function() {
                        if(document.URL.charAt(document.URL.length - 1) === '/') {
                            window.location.href = document.URL + fileid;
                        } else {
                            window.location.href = document.URL + '/' + fileid;
                        }
                    }, 1500);
                }
                console.log('│ └─ save successful.');
            } else {
                app.animateAlert({
                    header:'Oh no!', 
                    body: statMesg + " (error: " + request.status + ")", 
                    type: 'danger'
                });
                if(app.settings.autosave) {
                    $('#save-status').html(' Unsaved');
                }
                console.log('│ └─ error in saving: ' + statMesg + ' (error: ' + request.status + ')');
            }
        }
    }
    request.open('POST', '/save', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(app.data));
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

app.setKeybindings = function(e) {
    var changed = false;
    var toggle = function(set) {
        $(set).removeClass('btn-default').addClass('btn-primary');
        app.settings.keyButtons.forEach(function(elem, index, arr) {
            if(elem !== set) {
                $(elem).removeClass('btn-primary').addClass('btn-default');
            }
        });
        if(set.slice(1, -4) === 'vim' && !app.vimSourced) {
            $('body').append('<script src="/lib/codemirror/keymap/vim.js"></script>');
            app.vimSourced = true;
        } else if(set.slice(1, -4) === 'emacs' && !app.emacsSourced) {
            $('body').append('<script src="/lib/codemirror/keymap/emacs.js"></script>');
            app.emacsSourced = true;
        }
        changed = true;
    };
    if (typeof e === 'string') {
        console.log('here! ' + e);
        toggle(e);
        console.log(e.slice(1, -4) === 'no' ? 'default' : e.slice(1, -4) === "vim");
        app.editor.setOption("keyMap", e.slice(1, -4) === 'no' ? 'default' : e.slice(1, -4));
        app.settings.keys = e.slice(1, -4) === 'no' ? '' : e.slice(1, -4);
        console.log('├─ Keybindings loaded...');
        return;
    }
    if ($('#nokeys').is(e.target) && app.settings.keys !== '') {
        toggle('#nokeys');
        app.editor.setOption("keyMap", "default");
        app.settings.keys = '';
        app.animateAlert({header: 'Success!', body: 'Keybindings turned off.'});
    }
    else if ($('#vimkeys').is(e.target) && app.settings.keys !== 'vim') {
        toggle('#vimkeys');
        if(!app.settings.vimSourced) {
            $('body').append('<script src="/lib/codemirror/keymap/vim.js"></script>');
            app.vimSourced = true;
        }
        app.editor.setOption("keyMap", "vim");
        app.settings.keys = 'vim'
        app.animateAlert({header: 'Success!', body: 'Keybindings set to vim mode.'});
    }
    else if ($('#emacskeys').is(e.target) && app.settings.keys !== 'emacs') {
        toggle('#emacskeys');
        if(!app.settings.emacsSourced) {
            $('body').append('<script src="/lib/codemirror/keymap/emacs.js"></script>');
            app.emacsSourced = true;
        }
        app.editor.setOption("keyMap", "emacs");
        app.settings.keys = 'emacs';
        app.animateAlert({header: 'Success!', body: 'Keybindings set to emacs mode.'});
    }

    if (changed) {
        var data = {}; 
        data.user = app.data.user;
        data.settings = {
            editor: app.settings.keys
        }
        $.ajax('/settings', {
            data: data,
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('ERROR! ' + jqXHR.responseText.statMesg + ' (error: ' + jqXHR.status + ')...');
            },
            type: 'POST'
        });
    }
}

app.setAutoSave = function(e) {
    var orig = app.settings.autosave;
    var toggle = function(set) {
        if(set) {
            $('#manualsave').removeClass('btn-primary').addClass('btn-default');
            $('#autosave').removeClass('btn-default').addClass('btn-primary');
            app.settings.autosave = true;
            CodeMirror.commands.save = app.settings.autocomp ? void(0) : app.compile;
            app.save();
        } else {
            $('#autosave').removeClass('btn-primary').addClass('btn-default');
            $('#manualsave').removeClass('btn-default').addClass('btn-primary');
            app.settings.autosave = false;
            CodeMirror.commands.save = app.settings.autocomp ? app.save : app.compile;
            $('#save-status').html(' Save');
        }
    }

    if (typeof e === 'boolean') { toggle(e); }

    if ($('#manualsave').is(e.target) && app.settings.autosave) {
        toggle(false);
        app.animateAlert({header: 'Success!', body:'You are now in control of saving.'});
    } else if ($('#autosave').is(e.target) && !app.settings.autosave) {
        toggle(true);
        app.animateAlert({header: 'Success!', body:'Your changes will now autosave.'});
    }
    if(orig != app.settings.autosave) {
        var data = {}; 
        data.user = app.data.user;
        data.settings = {
            editor: app.settings.autosave
        }
        $.ajax('/settings', {
            data: data,
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('ERROR! ' + jqXHR.responseText.statMesg + ' (error: ' + jqXHR.status + ')...');
            },
            type: 'POST'
        });
    }
}

app.setAutoComp = function(e) {
    var orig = app.settings.autocomp;
    var toggle = function(set) {
        if(set) {
            $('#manualcompile').removeClass('btn-primary').addClass('btn-default');
            $('#autocompile').removeClass('btn-default').addClass('btn-primary');
            app.settings.autocomp = true;
            CodeMirror.commands.save = app.settings.autocomp ? void(0) : app.save;
            app.compile();
        } else {
            $('#autocompile').removeClass('btn-primary').addClass('btn-default');
            $('#manualcompile').removeClass('btn-default').addClass('btn-primary');
            app.settings.autocomp = false;
            CodeMirror.commands.save = app.compile;
        }
    }
    if ($('#manualcompile').is(e.target) && app.settings.autocomp) {
        toggle(false);
        app.animateAlert({header: 'Success!', body:'You are now in control of compiling.'});
    } else if ($('#autocompile').is(e.target) && !app.settings.autocomp) {
        toggle(true);
        app.animateAlert({header: 'Success!', body:'Your changes will now autocompile.'});
    }
    if(orig != app.settings.autocomp) {
        var data = {}; 
        data.user = app.data.user;
        data.settings = {
            editor: app.settings.autocomp
        }
        $.ajax('/settings', {
            data: data,
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('ERROR! ' + jqXHR.responseText.statMesg + ' (error: ' + jqXHR.status + ')...');
            },
            type: 'POST'
        });
    }
}

app.init = function () {
    console.log('│ Initializing app. . .');

    var keys     = $('#settings-button').data().editor;
    var autosave = $('#settings-button').data().autosave;
    var autocomp = $('#settings-button').data().autocomp;

    app.data.file.id = $('#filename').data().fileid;
    app.data.user.id = $('body').data().userid;

    marked.setOptions(app.settings.marked);

    app.editor = CodeMirror.fromTextArea($('#editor-pane')[0], app.settings.editor);

    app.setKeybindings('#' + keys + 'keys');
    app.setAutoSave(autosave || false);
    app.setAutoComp(autocomp || false);

    app.compile(false);

    $('.CodeMirror-wrap').typing({
        start: function() {
            console.log('├─┬ Typing...');
            if(app.settings.autocomp) { $('#preview-waiting').removeClass('hidden'); }
            if(app.settings.autosave) { $('#save-status').html(' Saving...'); }
        },
        stop: function() {
            console.log('│ └ typing stopped.');
            $('#preview-waiting').addClass('hidden');
            if(app.settings.autocomp) { app.compile(true); }
            if(app.settings.autosave) { app.save(); }
        },
        delay: 750
    });

    $('#save-button').click(app.save);
    $('#compile-button').click(function() { app.compile(true); });
    $('#discard-button').click(function() { location.reload(); });
    $('#expand-button').click(app.expandButton);
    $('#markdown-button').click(app.toggleHelp);


    $('#nokeys').click(app.setKeybindings);
    $('#vimkeys').click(app.setKeybindings);
    $('#emacskeys').click(app.setKeybindings);

    $('#manualsave').click(app.setAutoSave);
    $('#autosave').click(app.setAutoSave);

    $('#manualcompile').click(app.setAutoComp);
    $('#autocompile').click(app.setAutoComp);

    console.log('├── app intialized.');
}

app.init();
