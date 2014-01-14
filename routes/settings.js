var editors = ['', 'vim', 'emacs'];
// POST: /settings
module.exports = function (db) {
    var users = db.get('tdusers');
    
    return function (req, res) {
        if (!(req.body.user && req.body.user.id)) {
            res.send(401, {"statMesg": "You must be logged in to save files."});
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
               eturn;
            }
            res.end();
        });
    };
};
