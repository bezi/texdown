// POST to /rename
function renameGen (db) {
    var files = db.get('files');
    return function (req, res) {
        // must be authenticated for this to work
        var user = req.user;
        var fileid = req.body.fileid; 
        var filename = req.body.filename;
        if (!filename) {
            res.send(JSON.stringify({"statMesg": "No filename."}, 400));
            return;
        }
        files.find({"_id": fileid}, {}, function (err, docs) {
            if (err || !(docs.length === 1)) {
                res.send(JSON.stringify({"statMesg": "Database error."}, 400));
                return;
            }
            var doc = docs[0];
            if (!(user.id === doc.owner)) {
                res.send(JSON.stringify({"statMesg": "You don't have permission to rename this file."}, 400));
                return;
            }
            
            // rename the file
            files.update({"_id": fileid}, {"$set": {
                    "name": filename
                }}, function (err) {
                if (err) {
                    res.send(JSON.stringify({"statMesg": "Database error."}, 400));
                    return;
                }
                res.send(JSON.stringify({"statMesg": "Successfully renamed file."}));
                return;
            });
        });
    }
}

module.exports = renameGen;
