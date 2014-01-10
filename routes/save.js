// POST: /save
module.exports = function (db) {
    var files = db.get('files'); 
    var users = db.get('tdusers');
    return function (req, res) {
        if (!req.body.user) {
            res.send(400, {"statMesg": "Error retrieving user id."});
            return;
        }
        if (!req.body.user.id) {
            res.send(401, {"statMesg": "You must be logged in to save files."});
        }
        if (!req.body.file || !req.body.file.filename) {
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
                    res.send(409, {"statMesg": "The file \"" + req.body.file.filename + "\" is already taken."});
                    return;
                }
            });

            var file = {};
            file.name = req.body.file.filename;
            file.tags = [];
            file.owner = req.body.user.id;
            file.content = req.body.file.text;

            files.insert(file);
            // insert file into user's files
            // and return fileid
            files.find({
                "name": req.body.file.filename,
                "owner": req.body.user.id
            }, {}, function (err, docs) {
                if (err) {
                    res.send(500, {"statMesg": "Something went wrong with the database."});
                    return;
                } else if(docs.length !== 1){
                    res.send(404, {"statMesg": "User not found in database."});
                    return;
                }
                users.update({"id": req.body.user.id}, {"$push": {"files": docs[0]._id}});
                res.send({ "fileid": docs[0]._id }); 
            });    
        } else {
            files.find({"_id": fileid}, {}, function (err, docs){
                if (err) {
                    res.send(500, {"statMesg": "Something went wrong with the database."});
                    return;
                } else if (docs.length !== 1) {
                    res.send(404, {"statMesg": "The file could not be saved because it was not found in the databae."});
                }
                var doc = docs[0];
                if (!(req.userid === doc.owner)) {
                    res.send(JSON.stringify({ 
                        "statMesg": "You don't own this file."
                    }), 401);
                    return;
                }

                if (req.body.file.text) {
                    file.update({"_id": fileid}, {$set: {
                        "content": req.body.file.text, 
                        "name": req.body.file.filename
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

