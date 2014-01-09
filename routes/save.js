// POST: /save
module.exports = function (db) {
    var files = db.get('files'); 
    var users = db.get('tdusers');
    return function (req, res) {
        var fileid = req.body.fileid;
        // if the file doesn't have an id, make it
        if (!fileid) {
            // check that file name isn't taken
            files.find({
                "name": req.body.filename,
                "owner": req.userid
            }, {}, function (err, docs) {
                if (err || !(docs.length === 0)) {
                    res.send(JSON.stringify({"statMesg": "That file name is already taken."}, 400));
                    return;
                }
            });
            var file = {};
            file.name = req.body.filename;
            file.tags = [];
            file.owner = req.userid;
            file.content = req.body.filecontent;

            files.insert(file);
            // insert file into user's files
            // and return fileid
            files.find({
                "name": req.body.filename,
                "owner": req.userid
            }, {}, function (err, docs) {
                if (err || !(docs.length === 1)) {
                    res.send(JSON.stringify({"statMesg": "User not found in database."}, 400));
                    return;
                }
                users.update({"id": req.userid}, {"$push": {"files": docs[0]._id}});
                res.send(JSON.strigify({
                    "fileid": docs[0]._id
                })); 
            });    
        } else {
            files.find({"_id": fileid}, {}, function (err, docs){
                if (err || !(docs.length === 1)) {
                    res.send("There was an error with the database.");
                    return;
                }
                var doc = docs[0];
                if (!(req.userid === doc.owner)) {
                    res.send(JSON.stringify({ 
                        "statMesg": "You don't own this file."
                    }), 400);
                    return;
                }

                if (req.body.filecontent) {
                    file.update({"_id": fileid}, {$set: {
                        "content": req.body.filecontent, 
                        "name": req.body.filename
                    }}, function (err) {
                        if (err) {
                            res.send(JSON.stringify({ 
                                "statMesg": "Database error."
                            }), 400);
                            return;
                        }
                        res.send(JSON.strigify({
                            "fileid": fileid
                        })); 
                    });
                }
            });
        }
    };
};

