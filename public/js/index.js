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

app.processTimes = function() {
    $('.timestamp').each(function(index) {
        $(this).html(' - ' + moment($(this).html(), 'X').calendar());
    });
}

app.confirmDelete = function(e) {
    // prevent the button within a link from following its hyperlink
    e.preventDefault();

    // Store some values for convenience
    // Note that e.currentTarget gets the element that triggered the event,
    // whereas e.target gets the originally clicked element
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
    var data = {}; data.file = {}; data.user = {};
    data.file.id = $('#delete-confirm').data().fileid;
    data.user.id = $('body').data().userid;


    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            var statMesg = JSON.parse(request.responseText).statMesg;
            if (request.status === 200) {
                app.animateAlert({
                    header:'Success!', 
                    body: statMesg
                });
                // Get nodes to remove and animate it (fade through red)
                var pane = $('#file-display-' + data.file.id);
                pane.addClass('panel-heading-deleted')
                    .delay(600).fadeOut(500);
                // Stick this in here because this isn't an animation (can't be delay()'ed).
                setTimeout(function () {
                    pane.remove();
                }, 1100);

                console.log("|-- delete successful.");
            } else {
                app.animateAlert({
                    header:'Oh no!', 
                    body: statMesg + " (error: " + request.status + ")", 
                    type:'danger'
                });
                console.log("|-- error in deleting.");
            }
        }
    }
    request.open('DELETE', '/delete', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(data));
}

app.addTag = function(e, callback) {
    var newtag = $(e.currentTarget).children('input').val();
    $(e.currentTarget).parent().append('' 
            + '<span class="tag label label-primary">'
            + newtag + ' <span class="glyphicon glyphicon-remove">'
            + '</span></span>');
    // TODO Handle AJAX
}

app.removeTag = function(e) {
    console.log('Removing tag...');
}

app.init = function () {
    console.log('Initializing app. . .');
    moment.lang('en', {
        calendar: {
            lastDay:  '[Yesterday at] h:mma',
            sameDay:  'h:mma [Today]',
            nextDay:  '[Tomorrow at] h:mma',
            lastWeek: 'ddd, MMM D',
            nextWeek: 'ddd, MMM D',
            sameElse: 'ddd, MMM D'
        }
    });
    app.processTimes();
    $('#previews button.close').click(app.confirmDelete);
    $('#labels button.close').click(app.confirmDelete);
    $('.label .glyphicon.glyphicon-plus').click(function(e) {
        var index = $(e.currentTarget).data().index;
        $(e.currentTarget).toggleClass('glyphicon-plus').toggleClass('glyphicon-chevron-up');
        $('#tag-input-' + index).slideToggle(150);
    });
    $('.tag-input').off();
    $('.tag-input').keydown(function(e) {
        if(e.which == 13) {
            e.preventDefault();
            console.log('TAGGGS :D');
            app.addTag(e);
        }
    });
    $('.label .glyphicon.glyphicon-remove').click(app.removeTag);
    $('#delete-confirm').click(app.del);
    console.log('|-- app intialized.');
}

app.init();
