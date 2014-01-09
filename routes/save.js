// POST: /save
module.exports = function (db) {
    var files = db.get('files'); 
    return function (req, res) {
        files.find({"_id": req.body.fileid}, {}, function (err, docs){
            if (err) {
                res.send("There was an error with the database.");
                return;
            }
            if (docs.length === 0) {
                res.send(JSON.stringify({ 
                    "statMesg": "Something screwy happened."
                }), 400);
                return;
            }
            if (docs.length === 1) {
                var doc = docs[0];
                if (!(req.user.id === doc.owner)) {
                    res.send(JSON.stringify({ 
                        "statMesg": "You don't own this file."
                    }), 400);
                    return;
                }

                if (req.body.filecontent) {
                    file.update({"_id": req.body.fileid}, {$set: {
                        "content": req.body.filecontent, 
                        "name": req.body.filename
                    }}, function (err) {
                        if (err) {
                            res.send("Database error.", 400);
                            return;
                        }
                        res.send("Success."); 
                    });
                    return; 
                }
                return;
            }
            res.send("There was an error with the database.");
        });
    };
};

