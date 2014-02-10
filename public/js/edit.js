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
            $('#preview-pane pre').addClass("prettyprint").before('<div class="pre-header"><p class="text-center">' + app.data.file.name + ' - TeXDown</p></div>');
            $('#preview-pane pre code').addClass("prettyprint");
            $('.prettyprint').addClass('linenums');
            prettyPrint();
            console.log("│ └── compiling successful.");
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
        console.log('│ └── error in saving: user not signed in.');
        return;
    }

    app.data.file.name = $('#filename').val();
    if (!app.data.file.name && !app.data.file.id) {
        app.animateAlert({
            header: 'Whoops!', 
            body: 'Please enter a filename.', 
            type: 'danger', 
        });
            console.log('│ └── error in saving: no filename provided.');
        return;
    }
    app.data.file.content = app.editor.getValue();

    if(app.data.file.id) { // file exists
        $.ajax('/files/' + app.data.file.id, {
            method: 'PUT',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({file: app.data.file}),
            success: function(data, textStatus, jqXHR) {
                if(app.settings.autosave) {
                    $('#save-status').html(' Saved');
                } else {
                    app.animateAlert({
                        header:'Success!', 
                        body: 'Your file was saved.'
                    });
                }
                console.log('│ └── save successful.');
            },
            error: function(data, textStatus, jqXHR) {
                app.animateAlert({
                    header:'Oh no!', 
                    body: data + " (error: " + jqXHR.status + ")", 
                    type: 'danger'
                });
                if(app.settings.autosave) {
                    $('#save-status').html(' Unsaved');
                }
                console.log('│ └── error in saving: ' + data + ' (error: ' + jqXHR.status + ')');
            },
        });
    } else { // new file
        $.ajax('/files', {
            method: 'POST',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({file: app.data.file}),
            success: function(data, textStatus, jqXHR) {
                app.data.file.id = data.id;
                if(app.settings.autosave) {
                    $('#save-status').html(' Saved');
                } else {
                    app.animateAlert({
                        header:'Success!', 
                        body: 'Your file was saved.'
                    });
                }
                console.log('│ └── save successful.');
            },
            error: function(data, textStatus, jqXHR) {
                app.animateAlert({
                    header:'Oh no!', 
                    body: data + " (error: " + jqXHR.status + ")", 
                    type: 'danger'
                });
                if(app.settings.autosave) {
                    $('#save-status').html(' Unsaved');
                }
                console.log('│ └── error in saving: ' + data + ' (error: ' + jqXHR.status + ')');
            },
        });
    
    }
};

app.expandButton = function() {
    $('#preview-expanded .modal-body').html($('#preview-pane').html());
    $('#preview-expanded').modal();
}

app.setKeybindings = function(e) {
    var changed = false;
    var toggle = function(set) {
        app.settings.keyButtons.forEach(function(elem, index, arr) {
            $(elem).removeClass('btn-primary').addClass('btn-default');
        });
        $(set).removeClass('btn-default').addClass('btn-primary');
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
        toggle(e);
        app.editor.setOption("keyMap", e.slice(1, -4) === 'no' ? 'default' : e.slice(1, -4));
        app.settings.keys = e.slice(1, -4) === 'no' ? '' : e.slice(1, -4);
        console.log('│ ├ Keybindings loaded...');
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
            editor: app.settings.keys,
            autosave: app.settings.autosave,
            autocomp: app.settings.autocomp
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

    if (typeof e === 'boolean') { 
        toggle(e); 
        console.log('│ ├ Save settings loaded...');
    }

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
            editor: app.settings.keys,
            autosave: app.settings.autosave,
            autocomp: app.settings.autocomp
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

    if (typeof e === 'boolean') { 
        toggle(e); 
        console.log('│ ├ Compile settings loaded...');
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
            editor: app.settings.keys,
            autosave: app.settings.autosave,
            autocomp: app.settings.autocomp
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
    var loaded = 0;
    var LOAD_LIMIT = 2;
    console.log('│ Initializing app...');

    app.editor = CodeMirror.fromTextArea($('#editor-pane')[0], app.settings.editor);

    $.ajax('/settings', {
        beforeSend: function() {
            console.log('├─┬ Loading settings...');
        },
        success: function(data, textStatus, jqXHR) {
            $('#settings-loading').remove();
            $('#settings-wrapper').children().first().unwrap();
            app.setKeybindings('#' + (data.editor ? data.editor : 'no') + 'keys');
            app.setAutoSave(data.autosave === 'true');
            app.setAutoComp(data.autocomp === 'true');

            $('#nokeys').click(app.setKeybindings);
            $('#vimkeys').click(app.setKeybindings);
            $('#emacskeys').click(app.setKeybindings);

            $('#manualsave').click(app.setAutoSave);
            $('#autosave').click(app.setAutoSave);

            $('#manualcompile').click(app.setAutoComp);
            $('#autocompile').click(app.setAutoComp);

            console.log('│ └ loaded settings.');

            if(++loaded === LOAD_LIMIT) {
                console.log('├── app intialized.');
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('│ └ error loading settings.');
            $('#settings-loading h5').text('Failed to load settings')
                                     .append('<li class="divider"></li>');
            $('#settings-wrapper').children().first().unwrap();
        },
    });

    app.data.file.id = $('#filename').data().fileid || '';
    app.data.user.id = $('body').data().userid;

    if(app.data.file.id && app.data.file.id !== 'about') {
        $.ajax('/files/' + app.data.file.id, {
            beforeSend: function() {
                console.log('├─┬ Loading file ' + app.data.file.id + '...');
            },
            success: function(data, textStatus, jqXHR) {
                app.data.file = data.files[0];

                $('#filename').val(app.data.file.name);
                app.editor.setValue(app.data.file.content);
                app.compile(false);
                $('#preview-pane').scrollTop(0);

                $('#save-button').click(app.save);
                $('#compile-button').click(function() { app.compile(true); });
                console.log('│ └ loaded file.');
                if(++loaded === LOAD_LIMIT) {
                    console.log('├── app intialized.');
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log('│ └ error loading file.');
                if(++loaded === LOAD_LIMIT) {
                    console.log('├── app intialized.');
                }
                app.animateAlert({
                    header: 'Oh no!',
                    body: 'There was an error in loading the file: ' + jqXHR.responseText,
                    type: 'danger'
                });
            },
        });
    } else {
        $('#save-button').click(app.save);
        $('#compile-button').click(function() { app.compile(true); });

        app.compile(false);
        if(++loaded === LOAD_LIMIT) {
            console.log('├── app intialized.');
        }
    }

    marked.setOptions(app.settings.marked);

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
        delay: 1000
    });

    $('#discard-button').click(function() { location.reload(); });
    $('#expand-button').click(app.expandButton);
}

app.init();
