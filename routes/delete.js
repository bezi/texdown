// POST to /delete
function deleteGen (db) {
    var files = db.get('files');
    return function (req, res) {
        // must be authenticated for this to work
        var user = req.user;
        var fileid = req.body.fileid; 
        files.find({"_id": fileid}, {}, function (err, docs) {
            if (err || !(docs.length === 1)) {
                res.send(JSON.stringify({"statMesg": "Database error."}, 400));
                return;
            }
            var doc = docs[0];
            if (!(user.id === doc.owner)) {
                res.send(JSON.stringify({"statMesg": "You don't have permission to delete this file."}, 401));
                return;
            }
            
            // delete the file
            files.drop({"_id": fileid}, {}, function (err) {
                if (err) {
                    res.send(JSON.stringify({"statMesg": "Database error."}, 400));
                    return;
                }
                res.send(JSON.stringify({"statMesg": "Successfully deleted file."}));
                return;
            });
        });
    }
}

module.exports = deleteGen;
