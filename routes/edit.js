// GET: /edit
module.exports = function (db) {
    var files = db.get('files');
    return function (req, res) {
        if (req.params.id) {
            files.find({"_id": req.params.id}, {}, function (err, docs){
                if (err) {
                    res.send("There was an error with the database.");
                    return;
                }
                if (docs.length === 0) {
                    res.render('edit', { "newFile": true });
                    return;
                }
                if (docs.length === 1) {
                    var doc = docs[0];
                    if (!(req.user.id === doc.owner)) {
                        res.render('edit', { 
                            "error": true,
                            "err-msg": "Sorry, you don't own this file and the owner hasn't made it public."
                        });
                        return;
                    }

                    var data = {};
                    data.filename = doc.name;
                    data.fileid = doc._id;
                    data.filecontent = doc.content;
                    res.render('edit', data);
                    return;
                }
                res.send("There was an error with the database.");
            });
        }
        res.render('edit', { "newFile": true });
    };
};
