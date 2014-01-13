var moment = require('moment');

// POST: /save
module.exports = function (db) {
    var files = db.get('files'); 
    var users = db.get('tdusers');

    return function (req, res) {
        if (!(req.body.user && req.body.user.id)) {
            res.send(401, {"statMesg": "You must be logged in to save files."});
            return;
        }

        if (!(req.body.file && req.body.file.filename)) {
            res.send(400, {"statMesg": "Could not retrieve file object."});
            return;
        }

        var fileid = req.body.file.id;
        // if the file doesn't have an id, make it
        if (!fileid) {
            // check that file name isn't taken
            files.find({
                "name": req.body.file.filename,
                "owner": req.body.user.id
            }, {}, function (err, docs) {
                if (err) {
                    res.send(500, {"statMesg": "Something went wrong with the database."});
                    return;
                } else if (docs.length !== 0) {
                    res.send(409, {"statMesg": "The file name \"" + req.body.file.filename + "\" is already taken."});
                    return;
                }
            });

            var file = {};
            file.name = req.body.file.filename;
            file.tags = ["All Notes"];
            file.owner = req.body.user.id;
            file.content = req.body.file.text;
            file.created = Number(moment().format("X"));
            file.modified = file.created;

            files.insert(file);
            // and return fileid
            files.find({
                "name": req.body.file.filename,
                "owner": req.body.user.id
            }, {}, function (err, docs) {
                if (err || !(docs.length === 1)) {
                    res.send(500, {"statMesg": "Something went wrong with the database."});
                    return;
                }
                res.send({"fileid": docs[0]._id }); 
            });    
        } else {
            files.find({"_id": fileid}, {}, function (err, docs){
                if (err) {
                    res.send(500, {"statMesg": "Something went wrong with the database."});
                    return;
                } else if (docs.length !== 1) {
                    res.send(404, {"statMesg": "The file was not found in the database."});
                }
                var doc = docs[0];
                if (!(req.userid === doc.owner)) {
                    res.send(401, JSON.stringify({"statMesg": "You don't own this file."}));
                    return;
                }

                if (req.body.file.text) {
                    file.update({"_id": fileid}, {$set: {
                        "content": req.body.file.text, 
                        "name": req.body.file.filename,
                        "modified": Number(moment().format("X"))
                    }}, function (err) {
                        if (err) {
                            res.send(500, {"statMesg": "Something went wrong with the database."});
                        }
                        res.send({"statMesg": "File saved successfully."});
                        return;
                    });
                }
            });
        }
    };
};

