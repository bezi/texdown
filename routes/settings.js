var editors = ['', 'vim', 'emacs'];

function get(db) {
    var users = db.get('tdusers');
    
    return function(req, res) {
        users.find({id: req.user.id}, {}, function (err, docs) { 
            if(err) {
                var body = {}; body.error = {};
                res.send(500, "Something went wrong with the database.");
                return;
            } else if (docs.length === 0) {
                var body = {}; body.error = {};
                res.send(401, "Error authenticating user.");
                return;
            }
            res.send(docs[0].settings);
        });
    }
}

function post(db) {
    var users = db.get('tdusers');
    
    return function (req, res) {
        if (!(req.body.user && req.body.user.id)) {
            res.send(401, {"statMesg": "You must be logged in to save settings."});
            return;
        }

        if (!req.body.settings) {
            res.send(400, {"statMesg": "Could not retrieve settings object."});
            return;
        }
        var settings = {};
        settings = req.body.settings;

        var statMesg = '';
        for(var setting in settings) {
            if(!setting.hasOwnProperty) {continue;}
            switch(setting) {
                case 'editor':
                    if (editors.indexOf(settings[setting]) === -1) {
                        statMesg += '"editor: ' + settings[setting] + '" is not a setting.\n';
                        delete settings[setting];
                    }
                    break;
                case 'autosave':
                case 'autocomp':
                    if (settings[setting] !== 'true' && settings[setting] !== 'false') {
                        statMesg += '"' + setting + ': ' + settings[setting] + '" is not a setting.\n';
                        delete settings[setting];
                    }
                    break;
                default:
                    statMesg += '"' + setting + ': ' + settings[setting] + '" is not a setting.\n';
                    break;
            }
        }

        users.update({"id": req.body.user.id}, {"$set": {"settings": settings}}, function (err) {
            if (err) {
                res.send(500, {"statMesg": "Error with updating settings in database"});
                return;
            }
            res.end();
        });
    };
};

module.exports = {
    get: get,
    post: post
}
