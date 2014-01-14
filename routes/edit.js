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
                        return;
                    } else if (docs.length === 0) {
                        var body = {}; body.error = {};
                        body.error.code = 401; 
                        body.error.message = "Error authenticating user.";
                        res.render("500", body);
                        return;
                    }
                    data.user.settings = docs[0].settings;
                });
            }
            res.render('edit', data);
            return;
        }
        
        // has id
        if (!req.user) {
            res.redirect('/edit');
            return;
        }
        data.user = req.user;
        tdusers.find({id: req.user.id}, {}, function (err, docs) { 
            if(err) {
                var data = {}; data.error = {};
                data.error.code = 500; 
                data.error.message = "Something went wrong with the database.";
                res.render("500", data);
                return;
            } else if (docs.length === 0) {
                var data = {}; data.error = {};
                data.error.code = 401; 
                data.error.message = "Error authenticating user.";
                res.render("500", data);
                return;
            }
            data.user.settings = docs[0].settings;

            files.find({"_id": req.params.id}, {}, function (err, docs) {
                if (err || !(docs.length === 1 || docs.length === 0)) {
                    res.render('edit', {"statMesg": "There was an error with the database."});
                    return;
                }

                if (docs.length === 0) {
                    res.render('edit', {"statMesg": "File does not exist."});
                    return;
                }

                var doc = docs[0];
                if (!(req.user.id === doc.owner)) {
                    var data = {}; data.error = {};
                    data.error.code = 403; 
                    data.error.message = "You don't own this file.";
                    res.render("500", data);
                    return;
                }

                data.file = doc;
                data.file.id = doc._id;
                delete(data.file._id)
                res.render('edit', data);
                return;
            });
        });

    };
};
