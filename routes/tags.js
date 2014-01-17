// POST: /tags
module.exports = function (db) {
    var files = db.get('files');
    return function (req, res) {
        var user = req.body.user;
        var fileid = req.body.fileid;
        var tags = req.body.tags;
        if (!(user && user.id)) {
            res.send(401, {"statMesg": "You must be logged in to save files."});
            return;
        }

        if (!(fileid)) {
            res.send(409, {"statMesg": "You must send a valid fileid"});
            return;
        }

        if (!(fileid.length === 24)) {
            res.send(409, {"statMesg": "Fileid is not well formed."});
            return;
        }
        files.find({
            "_id": db.ObjectId(fileid),
            "owner": user.id
        }, {}, function (err, docs) {
            if (err) {
                res.send(500, {"statMesg": "Database error."});
                return;
            }
            if (docs.length !== 1) {
                res.send(409, {"statMesg": "You are not allowed to edit this file."});
            }
            files.update({
                "_id": db.ObjectId(fileid),
                "owner": user.id
            }, {
                "$set": {
                    "tags": tags
                }
            }, function (err) {
                if (err) {
                    res.send(500, {"statMesg": "Database error."});
                    return;
                }
                res.send({"statMesg": "Successfully updated tags."});
            });
        });
    };
};
