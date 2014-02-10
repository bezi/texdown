var util = require('util');
// GET: /edit
module.exports = function (db) {
    var files = db.get('files');
    var tdusers = db.get('tdusers');
    return function (req, res) {
        var data = {};
        if (!req.params.id) {
            // no id
            if (req.user) {
                data.user = req.user; 
                tdusers.find({id: req.user.id}, {}, function (err, docs) { 
                    if(err) {
                        var body = {}; body.error = {};
                        body.error.code = 500; 
                        body.error.message = "Something went wrong with the database.";
                        res.render("500", body);
                    } else if (docs.length === 0) {
                        var body = {}; body.error = {};
                        body.error.code = 401; 
                        body.error.message = "Error authenticating user.";
                        res.render("500", body);
                    }
                    data.user.settings = docs[0].settings;
                    res.render('edit', data);
                });
            }
        }
        
        // has id
        if (!req.user) {
            res.redirect('/edit');
            return;
        }
        data.user = req.user;

        tdusers.find({id: req.user.id}, {}, function (err, userdocs) { 
            if(err) {
                var body = {}; body.error = {};
                body.error.code = 500; 
                body.error.message = "Something went wrong with the database.";
                res.render("500", body);
                return;
            } else if (userdocs.length === 0) {
                var body = {}; body.error = {};
                body.error.code = 401; 
                body.error.message = "Error authenticating user.";
                res.render("500", body);
                return;
            }
            data.user.settings = userdocs[0].settings;

            files.find({"_id": req.params.id}, {}, function (err, filedocs) {
                if (err || !(filedocs.length === 1 || filedocs.length === 0)) {
                    res.render('500', {"statMesg": "There was an error with the database."});
                    return;
                }

                if (filedocs.length === 0) {
                    res.render('500', {"statMesg": "File does not exist."});
                    return;
                }

                var filedoc = filedocs[0];
                if (!(req.user.id === filedoc.owner)) {
                    var body = {}; body.error = {};
                    body.error.code = 403; 
                    body.error.message = "You don't own this file.";
                    res.render("500", body);
                    return;
                }

                data.file = filedoc;
                data.file.id = filedoc._id;
                delete(data.file._id);
                res.render('edit', data);
                return;
            });
        });

    };
};
