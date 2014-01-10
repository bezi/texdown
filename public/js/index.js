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
                // Get nodes to remove
                var panels = $('.file-display-' + data.file.id);

                // Animate the first one (change to red, fade out), then remove them
                $(panels[0]).removeClass('panel-info').addClass('panel-danger').delay(600).fadeOut(500);
                setTimeout(function () {
                    for(var i = 0; i < panels.length; ++i) {
                        panels[i].remove();
                    }
                    app.animateAlert({
                        header:'Success!', 
                        body: statMesg
                    });
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

app.init = function () {
    console.log('Initializing app. . .');
    $('#previews button.close').click(app.confirmDelete);
    $('#labels button.close').click(app.confirmDelete);
    $('#delete-confirm').click(app.del);
    console.log('|-- app intialized.');
}

app.init();
