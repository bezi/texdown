// DELETE to /delete
function deleteGen (db) {
    var files = db.get('files');
    return function (req, res) {
        // must be authenticated for this to work
        var user = req.body.user;
        var fileid = req.body.file.id; 
        console.log(fileid);
        if (fileid.length !== 24) {
            res.send(500, {"statMesg": "Invalid file id"});
            return;
        }
        files.find({"_id": db.ObjectID(fileid)}, {}, function (err, docs) {
            if (err || !(docs.length === 1)) {
                res.send(500, {"statMesg": "A database error got in the way of deleting the file."});
                return;
            }
            var doc = docs[0];
            if (!(user.id === doc.owner)) {
                res.send(401, {"statMesg": "You don't have permission to delete this file."});
                return;
            }
            
            // delete the file
            files.remove({"_id": db.ObjectID(fileid)}, function (err) {
                if (err) {
                    res.send(500, {"statMesg": "Unable to delete file due to database error."});
                    return;
                }
                res.send(JSON.stringify({"statMesg": "Successfully deleted file."}));
                return;
            });
        });
    }
}

module.exports = deleteGen;
