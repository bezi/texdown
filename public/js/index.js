var app = {}; app.files = null; app.tags = null;
app.settings = {
  moment: {
        calendar: {
            lastDay:  '[Yesterday at] h:mma',
            sameDay:  'h:mma [Today]',
            nextDay:  '[Tomorrow at] h:mma',
            lastWeek: 'ddd, MMM D',
            nextWeek: 'ddd, MMM D',
            sameElse: 'ddd, MMM D'
        }
    }
};
app.templates = {
    preview: function(file, index) {
        var taglist = file.tags.map(function(tag, index, array) {
            return '<span class="tag label label-primary">' + tag + ' '
                       + '<span class="glyphicon glyphicon-remove"></span>'
                   + '</span>';
        }).join('\n');
        return '<div class="panel-heading" id="file-display-' + file._id + '" data-index="' + index + '" data-fileid="' + file._id + '">\n'
                    + '<div class="row">\n'
                        + '<div class="col-md-7">\n'
                            + '<button class="pull-left close" type="button" data-fileid="' + file._id + '" data-filename="' + file.name + '" aria-hidden="true">\n'
                                + '<small><span class="glyphicon glyphicon-trash"></span>&nbsp;</small>\n'
                            + '</button>\n'
                            + '<a class="text-info panel-title" href="/edit/' + file._id + '">' + file.name + '</a>\n'
                            + '<small class="timestamp">' + file.modified + '</small>\n'
                        + '</div>\n'
                        + '<div class="col-md-5">\n'
                            + '<form class="tag-input" id="tag-input-' + index + '">\n'
                                + '<input class="form-control" placeholder="tagged">\n'
                            + '</form>'
                            + '<span class="add-tag label label-default">\n'
                                + '<span class="glyphicon glyphicon-plus"></span>\n'
                            + '</span>\n'
                            + taglist
                        + '</div>\n'
                    + '</div>\n'
                + '</div>\n';
    },
    tag: function(tag, count) {
        return  '<a class="list-group-item tag-display" id="tag-' + tag.replace(/\W/g, '') + '" href="#">' 
                    + '<span class="tag-contents">' + tag + '</span>'
                    + '<span class="badge pull-right">' + count + '</span>'
                + '</a>';
    }
};

/**
 * Utility function to show an alert.
 *
 * @param options an object with the following options: (optional in parens)
 *
 * @param header A (short) message that will be bolded.
 * @param body The rest of the message
 * @param (type) One of success, info, warning, or danger, (changes the color)
 * @param (delay) Time (in ')) to display the message before fading
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

app.processTimes = function() {
    $('.timestamp').each(function(index) {
        $(this).html(' - ' + moment($(this).html(), 'X').calendar());
    });
}

app.confirmDelete = function(e) {
    // prevent the button within a link from following its hyperlink
    e.preventDefault();

    // Store some values for convenience
    var trigger = $(e.currentTarget);
    var data = trigger.data();

    // Pass on file id so that the delete button can carry out DELETE /:id
    $('#delete-confirm').data("fileid", data.fileid);

    // Set confirm delete message text
    $('#confirm-delete-modal .alert').html("<h4>Whoa there...</h4><p><strong>Deletion is permanent.</strong> If you delete this file, it will be gone forever.<br>Are you sure you want to delete \"<em>" + data.filename + "</em>\"?</p>");

    // Dispatch modal
    $('#confirm-delete-modal').modal();
}
app.del = function (e) {
    // Retrieve data set by app.confirmDelete
    var fileid = $('#delete-confirm').data().fileid;

    $.ajax('/files/' + fileid, {
        method: 'DELETE',
        contentType: 'application/json;charset=UTF-8',
        success: function(data, textStatus, jqXHR) {
            // Get nodes to remove and animate it (fade through red)
            var pane = $('#file-display-' + fileid);
            pane.addClass('panel-heading-deleted')
                .delay(600).fadeOut(500);
            // Stick this in here because this isn't an animation (can't be delay()'ed).
            setTimeout(function () {
                pane.remove();
            }, 1100);

            console.log('├── delete successful.');
        },
        error: function(jqXHR, textStatus, errorThrown) {
            app.animateAlert({
                header:'Oh no!', 
                body: jqXHR.responseText + " (error: " + jqXHR.status + ")", 
                type:'danger'
            });
            console.log('├── error in deleting.');
        }
    })
}

app.addTag = function(e) {
    var newtag = $.trim($(e.currentTarget).children('input').val());
    $(e.currentTarget).children('input').val('');
    var index = Number($(e.currentTarget).parents('.panel-heading').data().index);
    if(app.files[index].tags.indexOf(newtag) === -1) {
        app.files[index].tags.push(newtag);
        $.ajax('/files/' + app.files[index]._id, {
            method: 'PUT',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({file: app.files[index]}),
            success: function(data, textStatus, errorThrown) {
                $(e.currentTarget).parent().append('' 
                    + '<span class="tag label label-primary">'
                    + newtag + ' <span class="glyphicon glyphicon-remove">'
                    + '</span></span>');
                $('.label .glyphicon.glyphicon-remove').click(app.removeTag);
                if(app.tags[newtag]) {
                    $('#tag-' + newtag.replace(/\W/g, '') + ' .badge').text(++(app.tags[newtag]));
                } else {
                    app.tags[newtag] = 1;
                    $('#labels').append(app.templates.tag(newtag, app.tags[newtag]));
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                app.animateAlert({
                    header: 'Whoops...',
                    body: 'We had some trouble adding the tag. (error: ' + jqXHR.status + ')',
                    type: 'danger'
                });
                console.log('Error adding tag: ' + jqXHR.responseText);
            }
        });
    }
}

app.removeTag = function(e) {
    var oldtag = $.trim($(e.currentTarget).parent().text());
    var fileindex = Number($(e.currentTarget).parents('.panel-heading').data().index);
    var tagindex = app.files[fileindex].tags.indexOf(oldtag);
    var file = app.files[fileindex];
    file.tags.splice(tagindex, 1);
    $.ajax('/files/' + file._id, {
        method: 'PUT',
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({file: file}),
        success: function(data, textStatus, errorThrown) {
            $(e.currentTarget).parent().remove();
            app.files[fileindex].tags.splice(tagindex, 1);
            if(--(app.tags[oldtag]) === 0) {
                $('#tag-' + oldtag.replace(/\W/g, '')).remove();
            } else {
                $('#tag-' + oldtag.replace(/\W/g, '') +' .badge').text(app.tags[oldtag]);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            app.animateAlert({
                header: 'Whoops...',
                body: 'We had some trouble removing the tag. (error: ' + jqXHR.status + ')',
                type: 'danger'
            });
            console.log('Error removing tag: ' + jqXHR.responseText);
        }
    });
}

app.filterTags = function(e) {
    e.preventDefault();
    var targetTag = $.trim($(e.currentTarget).find('.tag-contents').text());
    if($(e.currentTarget).hasClass('active')) {
        $('#previews .panel-heading').removeClass('hidden');
        $(e.currentTarget).removeClass('active');
    } else {
        $(e.currentTarget).siblings().removeClass('active');
        $('#previews .panel-heading').removeClass('hidden');
        $(e.currentTarget).addClass('active');
        $('#previews .panel-heading').each(function() {
            var fileindex = $(this).data().index;
            if(app.files[fileindex].tags.indexOf(targetTag) === -1) {
                $(this).addClass('hidden');
            }
        });
    }
}

app.init = function () {
    console.log('│ Initializing app...');
    moment.lang('en', app.settings.moment);

    $.ajax('/files', {
        success: function(data, textStatus, jqXHR) {
            console.log(data);
            app.files = data.files;
            app.tags = data.tags;
            app.files.forEach(function(file, index, array) {
                $('#previews').append(app.templates.preview(file, index));
            });
            for(var tag in app.tags) {
                if(app.tags.hasOwnProperty(tag)) {
                    $('#labels').append(app.templates.tag(tag, app.tags[tag]));
                }
            }
            app.processTimes();
            $('#previews button.close').click(app.confirmDelete);
            $('#labels button.close').click(app.confirmDelete);

            $('.label .glyphicon.glyphicon-plus').click(function(e) {
                var index = $(e.currentTarget).parents('.panel-heading').data().index;
                $(e.currentTarget).toggleClass('glyphicon-plus').toggleClass('glyphicon-minus');
                $('#tag-input-' + index).slideToggle(150);
            });
            $('.tag-input').off();
            $('.tag-input').keydown(function(e) {
                if(e.which == 13) {
                    e.preventDefault();
                    app.addTag(e);
                }
            });
            $('.label .glyphicon.glyphicon-remove').click(app.removeTag);
            $('#delete-confirm').click(app.del);
            $('.tag-display').click(app.filterTags);

            console.log('├── app intialized.');
      },
      failure: function(jqXHR, textStatus, errorThrown) {
          console.log(textStatus + errorThrown);
      }
    });
}

app.init();
