// GET: /edit
module.exports = function (db) {
    var files = db.get('files');
    return function (req, res) {
        files.find({"_id": req.params.id}, {}, function (err, docs){
            if (err || !(docs.length === 1) || !(docs.length === 0)) {
                res.send(JSON.stringify({"statMesg": "There was an error with the database."}), 400);
                return;
            }

            if (docs.length === 0) {
                res.send(JSON.stringify({"statMesg": "File does not exist."}), 400);
                return;
            }

            var doc = docs[0];
            if (!(req.user.id === doc.owner)) {
                res.send(JSON.stringify({"statMesg": "Sorry, you don't own this file."}), 400);
                return;
            }

            var data = {};
            data.filename = doc.name;
            data.fileid = doc._id;
            data.filecontent = doc.content;
            res.render('edit', data);
            return;
        });
    };
};
