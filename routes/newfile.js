// POST to /newfile
function newfileGen (db) {
    var files = db.get('files');
    var users = db.get('tdusers');
    return function (req, res) {
        // must be authenticated for this to work
        var filename = req.body.filename;
        // check that file name isn't taken
        files.find({
            "name": filename,
            "owner": req.user.id
        }, {}, function (err, docs) {
            if (err || !(docs.length === 0)) {
                res.send(JSON.stringify({"statMesg": "That file name is already taken."}, 400));
                return;
            }
        });
        // insert file into user's files
        var file = {};
        file.name = filename;
        file.tags = [];
        file.owner = req.user.id;
        file.content = "";

        files.insert(file);
        // return fileid
        files.find({
            "name": filename,
            "owner": req.user.id
        }, {}, function (err, docs) {
            if (err || !(docs.length === 1)) {
                res.send(JSON.stringify({"statMesg": "Database error."}, 400));
                return;
            }
            users.update({"id": req.user.id}, {"$push": {"files": docs[0]._id}});
            res.send(JSON.stringify({
                "fileid": docs[0]._id
            }));
            return;
        });    
    }
}

module.exports = newfileGen;
