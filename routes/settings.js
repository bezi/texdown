// POST: /settings
module.exports = function (db) {
    var users = db.get('tdusers');
    
    return function (req, res) {
        if (!(req.body.user && req.body.user.id)) {
            res.send(401, {"statMesg": "You must be logged in to save files."});
            return;
        }

        if (!(req.body.settings && req.body.settings.editor)) {
            res.send(409, {"statMesg": "Malformed settings."});
            return;
        }
        var settings = {};
        settings.editor = req.body.settings.editor;
        if (!(settings.editor === "" || settings.editor === "emacs" || settings.editor === "vim")) {
            res.send(400, {"statMesg": "Setting " + settings.editor + " not a valid editor."});
            return;
        }
        users.update({"id": req.body.user.id}, {"$set": {"settings": settings}}, function (err) {
            if (err) {
                res.send(400, {"statMesg": "Error with updating settings in database"});
               eturn;
            }
            res.send();
        });
        
    };
};
